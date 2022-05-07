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

  useEffect(() => {

    let url = `${getConfig().LMS_BASE_URL}/api/course_home/progress/${courseId}`
    const getCourseProgress = async () => {
      
      const { data } = await getAuthenticatedHttpClient().get(url)

      console.log("Course Progress")
      console.log(url)
      console.log(data)
      console.log(data.course_grade.percent)

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
      <CourseGradeProgress 
        availableCertId={available_cert_id}
        overallPercentage={overall_percentage}/>

      {/* <div className="apo-progress-wrapper" id="apo-progress-wrapper">
        <div id="apo-progress">
          <div className="progress-part">
            <span>Your current grade</span>
            <div className="progress">
              <div
                className="progress-bar"
                id="progress-value"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div className="passmark passmark-fix"></div>
          </div>
          <div className="percent-part">
            <span className="apo-progress-percent">{overall_percentage}%</span>
          </div>
          <div className="desc-part" id="under-pass">
            <div className="top d-flex">
              <div className="passmark" style={{ position: "relative" }}></div>
              <span className="desc-percent">Passing grade 60%</span>
            </div>
            <span className="desc-percent-bottom">
              Earn 60% to get Certificate
            </span>
          </div>
          <div className="desc-part" id="over-pass" style={{ display: "none" }}>
            <div className="top d-flex">
              <span className="earn">You earned this certificate</span>
            </div>
            <a
              target="_blank"
              href="https://sff.apixoxygen.com/certificate/:available_cert_id"
              className="view-cert"
              id="view-cert"
            >
              View certificate
            </a>
            <a className="no-cert" id="no-cert">
              View certificate
            </a>
          </div>
          <div className="refresh-part">
            <img
              src="../../generic/assets/refresh.png"
              alt=""
              id="refresh-btn"
            />
          </div>
        </div>
        <div id="apo-progress-mobile">
          <div className="top d-flex align-item-start">
            <div className="progress-part">
              <span>Your current progress</span>
            </div>
            <div className="percent-part">
              <span className="apo-progress-percent">
                {overall_percentage}%
              </span>
            </div>
            <div className="refresh-part" style={{ marginLeft: "6px" }}>
              <img
                src="../../generic/assets/refresh.png"
                alt=""
                id="refresh-btn-mobile"
              />
            </div>
          </div>
          <div className="mid d-flex">
            <div className="progress">
              <div
                className="progress-bar"
                id="progress-value-mobile"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div className="passmark passmark-fix"></div>
          </div>
          <div className="bottom d-flex" style={{ marginTop: "8px" }}>
            <div className="desc-part" id="under-pass-mobile">
              <div className="top d-flex">
                <div
                  className="passmark"
                  style={{ position: "relative" }}
                ></div>
                <span className="desc-percent">Passing grade 60%</span>
              </div>
              <span className="desc-percent-bottom">
                Earn 60% to get Certificate
              </span>
            </div>
            <div
              className="desc-part"
              id="over-pass-mobile"
              style={{ display: "none" }}
            >
              <div className="top d-flex">
                <span className="earn">You earned this certificate</span>
              </div>
              <a
                target="_blank"
                href="https://sff.apixoxygen.com/certificate/:available_cert_id"
                className="view-cert"
                id="view-cert-mobile"
              >
                View certificate
              </a>
              <a className="no-cert" id="no-cert-mobile">
                View certificate
              </a>
            </div>
          </div>
        </div>
      </div> */}


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
