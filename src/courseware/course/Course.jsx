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

  const overall_percentage_Ref = React.useRef(0);
  const available_cert_id_Ref = React.useRef("");
  const pass_point_Ref = React.useRef(0);
  const seenBox_Ref = React.useRef(true);
  const changedGrade_Ref = React.useRef("");
  const isPass_Ref = React.useRef(false);
  const gradeList_Ref = React.useRef([]);
  const amdon_API_GradeList_Ref = React.useRef([]);
  const apiFinish_Ref = React.useRef(false);

  const overall_percentage = overall_percentage_Ref.current
  const available_cert_id = available_cert_id_Ref.current
  const pass_point = pass_point_Ref.current
  const seenBox = seenBox_Ref.current
  const changedGrade = changedGrade_Ref.current
  const isPass = isPass_Ref.current
  const gradeList = gradeList_Ref.current
  const amdon_API_GradeList = amdon_API_GradeList_Ref.current
  const apiFinish = apiFinish_Ref.current

  const authenticatedUser = getUser()

  //post grade
  let postGradeApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades`
  const prepareGrade = ()=>{
    // check if current grade is pass or distinction
    if(isPass){
      return changedGrade
    }else{
      if(gradeList.indexOf(changedGrade) == gradeList.length-1){
        return changedGrade
      }else {
        let nextGradeList = gradeList.slice(gradeList.indexOf(changedGrade)+1, gradeList.length)
        let removeDuplicate = nextGradeList.filter((item) => amdon_API_GradeList.indexOf(item) == -1)
        return removeDuplicate
      }
      
    }
  }
  const body ={
    "user_id" : authenticatedUser.username,
    "course_id":encodeURIComponent(courseId),
    "grade" : prepareGrade()
  }

  const apiKey=process.env.AMDON_API_KEY;

  const logMe = (text)=>{
    console.log(text)
  }

  logMe('Im here')

  const removeElementsByClass = (className) =>{
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
  }

  const postGradeHandler = async () =>{
    if(body.grade){
      const response = await fetch(postGradeApiUrl,{
        method: 'POST',
        headers: new Headers({'apikey':apiKey,'content-type': 'application/json'}),
        body: JSON.stringify(body)
      })
      removeElementsByClass('overlay')
      document.body.style.overflow = 'auto';
      document.getElementById('certificate-receive-alert').style.display="none";
      console.log('post api response ',response)
    }else{
      // in case for testing
      removeElementsByClass('overlay')
      document.body.style.overflow = 'auto';
      document.getElementById('certificate-receive-alert').style.display="none";
    }
  }

  
  //post grade

  // call check api whether to show pass or change grade
  let checkApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades?user_id=${authenticatedUser.username}&course_id=${encodeURIComponent(courseId)}`
  const isChecked = async () =>{
    fetch(checkApiUrl,{
      method: 'GET',
      headers: new Headers({"apikey":apiKey,'content-type': 'application/json'}),
    }).then(res=>{
      console.log('is Checked api called',res)
      res.json().then((data) => {
          console.log('data',data);
          amdon_API_GradeList_Ref.current = data;
          if(data.length == 0){
            seenBox_Ref.current = false
          }
          else{
            //compare grade
            console.log('compare ',changedGrade , data[0])
            if(changedGrade && data.indexOf(changedGrade) != -1){
              seenBox_Ref.current = false
            }else{
              seenBox_Ref.current = true
            }
          }
      });
    })

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
      available_cert_id_Ref.current = certId
      }
      
      if(data.course_grade != null) {
        overall_percentage_Ref.current= Math.round(data.course_grade.percent * 100)
      }

      // various Grade

      if(data.grading_policy != null && data.grading_policy.grade_range != null && Object.keys(data.grading_policy.grade_range).length > 1) {
        let minArr = Object.values(data.grading_policy.grade_range)
        let min = Math.min(...minArr)

        let maxGradeArr = Object.keys(data.grading_policy.grade_range)
        let maxGrade = Math.max(...maxGradeArr)

        gradeList_Ref.current = maxGradeArr

        let minGradeArr = Object.keys(data.grading_policy.grade_range)
        let minGrade = Math.max(...minGradeArr)

        pass_point_Ref.current = min

        const checkChangeGrade = ()=>{

          const differentGrade = () =>{
            return data.course_grade.letter_grade !== changedGrade
          }

          const equalWithMinGrade = () =>{
            return data.course_grade.letter_grade=== minGrade
          }

          const equalWithMaxGrade = () => {
            return data.course_grade.letter_grade === maxGrade
          }

          if(differentGrade()){
            if(equalWithMinGrade() || equalWithMaxGrade()){
              return true
            }
          }
          return false
        }

        if(checkChangeGrade()){
          seenBox_Ref.current = false
          changedGrade_Ref.current = data.course_grade.letter_grade
          if(data.course_grade.letter_grade=== minGrade){
            isPass_Ref.current = true // just pass
          }else {
            isPass_Ref.current = false // distinction
          }
        }
      }else if(data.grading_policy != null && data.grading_policy.grade_range != null) {
        //need to check pass fail condition
        let valueArray = Object.values(data.grading_policy.grade_range)
        if(valueArray[0] < data.course_grade.percent){
          seenBox_Ref.current = false
          changedGrade_Ref.current = data.grading_policy.grade_range
          pass_point_Ref.current=data.grading_policy.grade_range.Pass
        }
      }
      apiFinish_Ref.current = true
      isChecked()

    }

  }

  

  useEffect(() => {
    getCourseProgress()
    window.addEventListener('load',()=>{
      getCourseProgress()
    })
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
      {
        // available_cert_id && !seenBox && 
        <CertificateReceiveAlert  
        availableCertId={available_cert_id}
          courseId={courseId}
          isPass={isPass}
          postGradeHandler={postGradeHandler}
          overallPercentage={overall_percentage}
          />
      }
      {
        apiFinish && <CourseGradeProgress 
        availableCertId={available_cert_id}
        overallPercentage={overall_percentage}
        passingPoint={pass_point}/>
      }
      
      
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
