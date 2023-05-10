import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { breakpoints, useWindowSize } from '@edx/paragon';

import { AlertList } from '../../generic/user-messages';

import Sequence from './sequence';

import { CelebrationModal, shouldCelebrateOnSectionLoad, WeeklyGoalCelebrationModal } from './celebration';
import ContentTools from './content-tools';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import SidebarProvider from './sidebar/SidebarContextProvider';
import SidebarTriggers from './sidebar/SidebarTriggers';

import { useModel } from '../../generic/model-store';
import { getSessionStorage, setSessionStorage } from '../../data/sessionStorage';

/** [MM-P2P] Experiment */
import { initCoursewareMMP2P, MMP2PBlockModal } from '../../experiments/mm-p2p';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import CourseGradeProgress from './CourseGradeProgress';
import CertificateReceiveAlert from './CertificateReceiveAlert';

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
  windowWidth,
}) {
  const course = useModel('coursewareMeta', courseId);
  const {
    celebrations,
    isStaff,
  } = useModel('courseHomeMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);


  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const dispatch = useDispatch();

  const [firstSectionCelebrationOpen, setFirstSectionCelebrationOpen] = useState(false);
  // If streakLengthToCelebrate is populated, that modal takes precedence. Wait til the next load to display
  // the weekly goal celebration modal.
  const [weeklyGoalCelebrationOpen, setWeeklyGoalCelebrationOpen] = useState(
    celebrations && !celebrations.streakLengthToCelebrate && celebrations.weeklyGoal,
  );
  const shouldDisplayTriggers = windowWidth >= breakpoints.small.minWidth;
  const daysPerWeek = course?.courseGoals?.selectedGoal?.daysPerWeek;

  // Responsive breakpoints for showing the notification button/tray
  const shouldDisplayNotificationTrayOpenOnLoad = windowWidth > breakpoints.medium.minWidth;

  // Course specific notification tray open/closed persistance by browser session
  if (!getSessionStorage(`notificationTrayStatus.${courseId}`)) {
    if (shouldDisplayNotificationTrayOpenOnLoad) {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'open');
    } else {
      // responsive version displays the tray closed on initial load, set the sessionStorage to closed
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    }
  }


  const [overall_percentage, setOverall_percentage] = useState(0);
  const [available_cert_id, setAvailable_cert_id] = useState("");
  const [pass_point, setPass_point] = useState(0);
  const [progress_data, setProgress_data] = useState({});

  useEffect(() => {
    const celebrateFirstSection = celebrations && celebrations.firstSection;
    setFirstSectionCelebrationOpen(shouldCelebrateOnSectionLoad(
      courseId,
      sequenceId,
      celebrateFirstSection,
      dispatch,
      celebrations,
    ));
    let url = `${getConfig().LMS_BASE_URL}/api/course_home/progress/${courseId}`
    const getCourseProgress = async () => {
      
      const { data } = await getAuthenticatedHttpClient().get(url)

      console.log("Course Progress")
      console.log(url)
      console.log(data)
      setProgress_data(data)
      console.log(data.course_grade.percent)
      console.log("PassingPoint")
      console.log(data.grading_policy.grade_range.Pass)

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
          setOverall_percentage(Math.round(data.course_grade.percent * 100))
        }

        // various Grade

        if(data.grading_policy != null && data.grading_policy.grade_range != null && Object.keys(data.grading_policy.grade_range).length > 1) {
          let arr = Object.values(data.grading_policy.grade_range);
          let min = Math.min(...arr);
          setPass_point(min)
        }else if(data.grading_policy != null && data.grading_policy.grade_range != null) {
          setPass_point(data.grading_policy.grade_range.Pass)
        }

      }

      // setAvailable_cert_id("12345678")
      // setOverall_percentage(70)

    }

    getCourseProgress()

  },[courseId,
    sequenceId,
    unitId,
    nextSequenceHandler,
    previousSequenceHandler,
    unitNavigationHandler])

  /** [MM-P2P] Experiment */
  const MMP2P = initCoursewareMMP2P(courseId, sequenceId, unitId);

  return (
    <SidebarProvider courseId={courseId} unitId={unitId}>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="position-relative d-flex align-items-start">
        <CourseBreadcrumbs
          courseId={courseId}
          sectionId={section ? section.id : null}
          sequenceId={sequenceId}
          isStaff={isStaff}
          unitId={unitId}
          //* * [MM-P2P] Experiment */
          mmp2p={MMP2P}
        />
        {shouldDisplayTriggers && (
          <SidebarTriggers />
        )}
      </div>
      <CertificateReceiveAlert  
        availableCertId={available_cert_id}
        courseId={courseId}
        progress_data={progress_data}
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
      <CelebrationModal
        courseId={courseId}
        isOpen={firstSectionCelebrationOpen}
        onClose={() => setFirstSectionCelebrationOpen(false)}
      />
      <WeeklyGoalCelebrationModal
        courseId={courseId}
        daysPerWeek={daysPerWeek}
        isOpen={weeklyGoalCelebrationOpen}
        onClose={() => setWeeklyGoalCelebrationOpen(false)}
      />
      <ContentTools course={course} />
      { /** [MM-P2P] Experiment */ }
      { MMP2P.meta.modalLock && <MMP2PBlockModal options={MMP2P} /> }
    </SidebarProvider>
  );
}

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

function CourseWrapper(props) {
  // useWindowSize initially returns an undefined width intentionally at first.
  // See https://www.joshwcomeau.com/react/the-perils-of-rehydration/ for why.
  // But <Course> has some tricky window-size-dependent, session-storage-setting logic and React would yell at us if
  // we exited that component early, before hitting all the useState() calls.
  // So just skip all that until we have a window size available.
  const windowWidth = useWindowSize().width;
  if (windowWidth === undefined) {
    return null;
  }

  return <Course {...props} windowWidth={windowWidth} />;
}

export default CourseWrapper;
