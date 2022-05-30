import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { AlertList } from '../../generic/user-messages';

import Sequence from './sequence';

import { CelebrationModal, shouldCelebrateOnSectionLoad } from './celebration';
import ContentTools from './content-tools';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import NotificationTrigger from './NotificationTrigger';

import { useModel } from '../../generic/model-store';
import useWindowSize, { responsiveBreakpoints } from '../../generic/tabs/useWindowSize';
import { getLocalStorage, setLocalStorage } from '../../data/localStorage';

/** [MM-P2P] Experiment */
import { initCoursewareMMP2P, MMP2PBlockModal } from '../../experiments/mm-p2p';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import CourseGradeProgress from './CourseGradeProgress';
import CertificateReceiveAlert from './CertificateReceiveAlert';

// import { getUser } from '../experiments/mm-p2p/utils'
import {getUser} from '../../experiments/mm-p2p/utils'

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
}) {
  const course = useModel('coursewareMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);

  const {
    celebrations,
    verifiedMode,
  } = course;

  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const dispatch = useDispatch();
  const celebrateFirstSection = celebrations && celebrations.firstSection;
  const celebrationOpen = shouldCelebrateOnSectionLoad(
    courseId, sequenceId, unitId, celebrateFirstSection, dispatch, celebrations,
  );

  const shouldDisplayNotificationTrigger = useWindowSize().width >= responsiveBreakpoints.small.minWidth;

  const shouldDisplayNotificationTrayOpen = useWindowSize().width > responsiveBreakpoints.medium.minWidth;

  const [notificationTrayVisible, setNotificationTray] = verifiedMode
    && shouldDisplayNotificationTrayOpen ? useState(true) : useState(false);
  const isNotificationTrayVisible = () => notificationTrayVisible && setNotificationTray;
  const toggleNotificationTray = () => {
    if (notificationTrayVisible) { setNotificationTray(false); } else { setNotificationTray(true); }
  };

  if (!getLocalStorage('notificationStatus')) {
    setLocalStorage('notificationStatus', 'active'); // Show red dot on notificationTrigger until seen
  }

  if (!getLocalStorage('upgradeNotificationCurrentState')) {
    setLocalStorage('upgradeNotificationCurrentState', 'initialize');
  }

  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage('notificationStatus'));
  const [upgradeNotificationCurrentState, setupgradeNotificationCurrentState] = useState(getLocalStorage('upgradeNotificationCurrentState'));

  const onNotificationSeen = () => {
    setNotificationStatus('inactive');
    setLocalStorage('notificationStatus', 'inactive');
  };

  const [overall_percentage, setOverall_percentage] = useState(0);
  const [available_cert_id, setAvailable_cert_id] = useState("");
  const [pass_point, setPass_point] = useState(0);
  const [seenBox,setSeenBox] = useState(false);
  const [changedGrade,setChangedGrade] = useState("");

  const authenticatedUser = getUser()

  //post grade
  let postGradeApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades`
  const body ={
    "user_id" : authenticatedUser.username,
    "course_id":courseId,
    "grade" : changedGrade
  }

  const apiKey=process.env.AMDON_API_KEY;

  const postGradeHandler = async () =>{
    const response = await fetch(postGradeApiUrl,{
      method: 'POST',
      headers: new Headers({"apikey":apiKey,'content-type': 'application/json'}),
      body: JSON.stringify(body)
    })
    document.getElementById('certificate-receive-alert').style.display="none";
    console.log('post api response ',response)
  }
  

  //post grade



  useEffect(() => {

    
    const apiKey=process.env.AMDON_API_KEY;
    // call check api whether to show pass or change grade
    let checkApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades?user_id=${authenticatedUser.username}&course_id=${courseId}`
    const isChecked = async () =>{
      const response = await fetch(checkApiUrl,{
        method: 'GET',
        headers:{"apikey":apiKey}
      })
      console.log('is Checked api called')
      
      if(response.length == 0){
        console.log(response);
        setSeenBox(false);
      }
      else{
        console.log(response);

        //comlpare grade
        if(changedGrade !== response[0]){
          setSeenBox(false);
        }else{
          setSeenBox(true);
        }
      }
    }
    
    // call check api whether to show pass or change grade

    

    let url = `${getConfig().LMS_BASE_URL}/api/course_home/progress/${courseId}`
    const getCourseProgress = async () => {
      
      const { data } = await getAuthenticatedHttpClient().get(url)

      console.log("Course Progress")
      console.log(url)
      console.log(data)
      console.log(data.course_grade.percent)
      console.log("PassingPoint")
      console.log(data.grading_policy.grade_range)


      if(data != null) {

        if(data.certificate_data != null) {
          let certId = null
        if(data.certificate_data.cert_web_view_url) {

          let certAry = data.certificate_data.cert_web_view_url.split("certificates/")
          if(certAry.length == 2)
            certId = certAry[1]

        }

        //data.course_grade.percent
        setAvailable_cert_id(certId)
        }
        
        if(data.course_grade != null) {
          setOverall_percentage(data.course_grade.percent * 100)
        }

        // various Grade

        if(data.grading_policy != null && data.grading_policy.grade_range != null && Object.keys(data.grading_policy.grade_range).length > 1) {
          let arr = Object.values(data.grading_policy.grade_range)
          let min = Math.min(...arr)
          console.log('min ',min)
          console.log('new branch works')
          setPass_point(min)
          console.log('current grade ',changedGrade)
          console.log('api grade ',data.course_grade.letter_grade)
          if(data.course_grade.letter_grade !== changedGrade){
            console.log('set new grade')
            setSeenBox(false);
            setChangedGrade(data.course_grade.letter_grade)
          }
          
        }else if(data.grading_policy != null && data.grading_policy.grade_range != null) {
          if(data.course_grade.letter_grade !== "FAIL"){
            setChangedGrade(data.course_grade.letter_grade)
          }
          setPass_point(data.grading_policy.grade_range.Pass)
        }

        isChecked()

      }

      // setAvailable_cert_id("12345678")
      // setOverall_percentage(70)

    }

    getCourseProgress()

  })

  /** [MM-P2P] Experiment */
  const MMP2P = initCoursewareMMP2P(courseId, sequenceId, unitId);

  return (
    <>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="position-relative">
        <CourseBreadcrumbs
          courseId={courseId}
          sectionId={section ? section.id : null}
          sequenceId={sequenceId}
          isStaff={course ? course.isStaff : null}
          unitId={unitId}
          //* * [MM-P2P] Experiment */
          mmp2p={MMP2P}
        />

        { shouldDisplayNotificationTrigger ? (
          <NotificationTrigger
            toggleNotificationTray={toggleNotificationTray}
            isNotificationTrayVisible={isNotificationTrayVisible}
            notificationStatus={notificationStatus}
            setNotificationStatus={setNotificationStatus}
            upgradeNotificationCurrentState={upgradeNotificationCurrentState}
          />
        ) : null}
      </div>
      <CertificateReceiveAlert  
      availableCertId={available_cert_id}
        checked={seenBox}
        courseId={courseId}
        changedGrade={changedGrade}
        postGradeHandler={postGradeHandler}
        />
      <CourseGradeProgress 
        availableCertId={available_cert_id}
        overallPercentage={overall_percentage}
        passingPoint={pass_point}/>

      <AlertList topic="sequence" />
      <Sequence
        unitId={unitId}
        sequenceId={sequenceId}
        courseId={courseId}
        unitNavigationHandler={unitNavigationHandler}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
        toggleNotificationTray={toggleNotificationTray}
        isNotificationTrayVisible={isNotificationTrayVisible}
        notificationTrayVisible={notificationTrayVisible}
        notificationStatus={notificationStatus}
        setNotificationStatus={setNotificationStatus}
        onNotificationSeen={onNotificationSeen}
        upgradeNotificationCurrentState={upgradeNotificationCurrentState}
        setupgradeNotificationCurrentState={setupgradeNotificationCurrentState}
        //* * [MM-P2P] Experiment */
        mmp2p={MMP2P}
      />
      {celebrationOpen && (
        <CelebrationModal
          courseId={courseId}
          open
        />
      )}
      <ContentTools course={course} />
      { /** [MM-P2P] Experiment */ }
      { MMP2P.meta.modalLock && <MMP2PBlockModal options={MMP2P} /> }
    </>
  );
}

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

export default Course;
