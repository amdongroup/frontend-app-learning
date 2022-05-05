import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  sendTrackEvent,
  sendTrackingLogEvent,
} from "@edx/frontend-platform/analytics";
import { getAuthenticatedUser } from "@edx/frontend-platform/auth";
import { injectIntl, intlShape } from "@edx/frontend-platform/i18n";

import { Button, Toast } from "@edx/paragon";
import { AlertList } from "../../generic/user-messages";

import CourseDates from "./widgets/CourseDates";
import CourseGoalCard from "./widgets/CourseGoalCard";
import CourseHandouts from "./widgets/CourseHandouts";
import CourseTools from "./widgets/CourseTools";
import { fetchOutlineTab } from "../data";
import genericMessages from "../../generic/messages";
import messages from "./messages";
import Section from "./Section";
import ShiftDatesAlert from "../suggested-schedule-messaging/ShiftDatesAlert";
import UpdateGoalSelector from "./widgets/UpdateGoalSelector";
import UpgradeNotification from "../../generic/upgrade-notification/UpgradeNotification";
import UpgradeToShiftDatesAlert from "../suggested-schedule-messaging/UpgradeToShiftDatesAlert";
import useCertificateAvailableAlert from "./alerts/certificate-status-alert";
import useCourseEndAlert from "./alerts/course-end-alert";
import useCourseStartAlert from "../../alerts/course-start-alert";
import usePrivateCourseAlert from "./alerts/private-course-alert";
import useScheduledContentAlert from "./alerts/scheduled-content-alert";
import { useModel } from "../../generic/model-store";
import WelcomeMessage from "./widgets/WelcomeMessage";
import ProctoringInfoPanel from "./widgets/ProctoringInfoPanel";
import AccountActivationAlert from "../../alerts/logistration-alert/AccountActivationAlert";

/** [MM-P2P] Experiment */
import { initHomeMMP2P, MMP2PFlyover } from "../../experiments/mm-p2p";

function OutlineTab({ intl }) {
  const { courseId } = useSelector((state) => state.courseHome);

  const { isSelfPaced, org, title, username, userTimezone } = useModel(
    "courseHomeMeta",
    courseId
  );

  const {
    accessExpiration,
    courseBlocks: { courses, sections },
    courseGoals: { goalOptions, selectedGoal } = {},
    datesBannerInfo,
    datesWidget: { courseDateBlocks },
    resumeCourse: { hasVisitedCourse, url: resumeCourseUrl },
    offer,
    timeOffsetMillis,
    verifiedMode,
  } = useModel("outline", courseId);

  const [courseGoalToDisplay, setCourseGoalToDisplay] = useState(selectedGoal);
  const [goalToastHeader, setGoalToastHeader] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const logResumeCourseClick = () => {
    sendTrackingLogEvent("edx.course.home.resume_course.clicked", {
      ...eventProperties,
      event_type: hasVisitedCourse ? "resume" : "start",
      url: resumeCourseUrl,
    });
  };

  // Below the course title alerts (appearing in the order listed here)
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);
  const privateCourseAlert = usePrivateCourseAlert(courseId);
  const scheduledContentAlert = useScheduledContentAlert(courseId);

  const rootCourseId = courses && Object.keys(courses)[0];

  const hasDeadlines =
    courseDateBlocks &&
    courseDateBlocks.some((x) => x.dateType === "assignment-due-date");

  const logUpgradeToShiftDatesLinkClick = () => {
    sendTrackEvent("edx.bi.ecommerce.upsell_links_clicked", {
      ...eventProperties,
      linkCategory: "personalized_learner_schedules",
      linkName: "course_home_upgrade_shift_dates",
      linkType: "button",
      pageName: "course_home",
    });
  };

  const isEnterpriseUser = () => {
    const authenticatedUser = getAuthenticatedUser();
    const userRoleNames = authenticatedUser
      ? authenticatedUser.roles.map((role) => role.split(":")[0])
      : [];

    return userRoleNames.includes("enterprise_learner");
  };

  /** [[MM-P2P] Experiment */
  const MMP2P = initHomeMMP2P(courseId);

  /** show post enrolment survey to only B2C learners */
  const learnerType = isEnterpriseUser() ? "enterprise_learner" : "b2c_learner";
  const [overall_percentage, setOverall_percentage] = useState(0);
  const [available_cert_id, setAvailable_cert_id] = useState("");

  useEffect(() => {
    window.addEventListener("scroll", (event) => {
      let scroll = this.scrollY;
      console.log(scroll);
      if (scroll >= 230) {
        document.getElementById("apo-progress-wrapper").style.position =
          "fixed";
        document.getElementById("apo-progress-wrapper").style.zIndex = "999";
        document.getElementById("apo-progress-wrapper").style.top = "0";
        document.getElementById("apo-progress-wrapper").style.background =
          "rgba(0, 0, 0, 0.1)";
      } else {
        document.getElementById("apo-progress-wrapper").style.position = "";
        document.getElementById("apo-progress-wrapper").style.zIndex = "";
        document.getElementById("apo-progress-wrapper").style.top = "";
        document.getElementById("apo-progress-wrapper").style.background =
          "#F2F3F5";
      }
    });

    //api call here
    // fetch("https://api.edx.org/api/certificates/v0/certificates/").then(data=>{
    //   console.log(data);
    //   setOverall_percentage(data.overall_percentage);
    //   setAvailable_cert_id(data.available_cert_id);
    // });
  }, []);
  componentDidMount(() => {
    if (overall_percentage >= 60) {
      document.getElementById("under-pass").style.display = "none";
      document.getElementById("over-pass").style.display = "";
      document.getElementById("under-pass-mobile").style.display = "none";
      document.getElementById("over-pass-mobile").style.display = "";
    } else {
      document.getElementById("under-pass-mobile").style.display = "";
      document.getElementById("over-pass-mobile").style.display = "none";
    }

    if (available_cert_id) {
      document.getElementById("view-cert").style.display = "";
      document.getElementById("no-cert").style.display = "none";
      document.getElementById("view-cert-mobile").style.display = "";
      document.getElementById("no-cert-mobile").style.display = "none";
    } else {
      document.getElementById("view-cert").style.display = "none";
      document.getElementById("no-cert").style.display = "";
      document.getElementById("view-cert-mobile").style.display = "none";
      document.getElementById("no-cert-mobile").style.display = "";
    }
    document
      .getElementById("refresh-btn")
      .addEventListener("click", function () {
        location.reload();
      });
    document.getElementById("progress-value").style.width =
      overall_percentage + "%";

    document
      .getElementById("refresh-btn-mobile")
      .addEventListener("click", function () {
        location.reload();
      });
    document.getElementById("progress-value-mobile").style.width =
      overall_percentage + "%";
  });

  return (
    <>
      <Toast
        closeLabel={intl.formatMessage(genericMessages.close)}
        onClose={() => setGoalToastHeader("")}
        show={!!goalToastHeader}
      >
        {goalToastHeader}
      </Toast>
      <div
        data-learner-type={learnerType}
        className="row w-100 mx-0 my-3 justify-content-between"
      >
        <div className="col-12 col-sm-auto p-0">
          <div role="heading" aria-level="1" className="h2">
            {title}
          </div>
        </div>
        {resumeCourseUrl && (
          <div className="col-12 col-sm-auto p-0">
            <Button
              variant="primary"
              block
              href={resumeCourseUrl}
              onClick={() => logResumeCourseClick()}
            >
              {hasVisitedCourse
                ? intl.formatMessage(messages.resume)
                : intl.formatMessage(messages.start)}
            </Button>
          </div>
        )}
      </div>
      {/** [MM-P2P] Experiment (className for optimizely trigger) */}
      <div className="row course-outline-tab">
        <AccountActivationAlert />
        <div className="col-12">
          <AlertList
            topic="outline-private-alerts"
            customAlerts={{
              ...privateCourseAlert,
            }}
          />
        </div>
        <div className="col col-12 col-md-8">
          {/** [MM-P2P] Experiment (the conditional) */}
          {!MMP2P.state.isEnabled && (
            <AlertList
              topic="outline-course-alerts"
              className="mb-3"
              customAlerts={{
                ...certificateAvailableAlert,
                ...courseEndAlert,
                ...courseStartAlert,
                ...scheduledContentAlert,
              }}
            />
          )}
          {isSelfPaced && hasDeadlines && !MMP2P.state.isEnabled && (
            <>
              <ShiftDatesAlert model="outline" fetch={fetchOutlineTab} />
              <UpgradeToShiftDatesAlert
                model="outline"
                logUpgradeLinkClick={logUpgradeToShiftDatesLinkClick}
              />
            </>
          )}
          {!courseGoalToDisplay && goalOptions && goalOptions.length > 0 && (
            <CourseGoalCard
              courseId={courseId}
              goalOptions={goalOptions}
              title={title}
              setGoalToDisplay={(newGoal) => {
                setCourseGoalToDisplay(newGoal);
              }}
              setGoalToastHeader={(newHeader) => {
                setGoalToastHeader(newHeader);
              }}
            />
          )}
          <div className="apo-progress-wrapper" id="apo-progress-wrapper">
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
                <span className="apo-progress-percent">
                  {overall_percentage}%
                </span>
              </div>
              <div className="desc-part" id="under-pass">
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
                id="over-pass"
                style={{ display: "none" }}
              >
                <div className="top d-flex">
                  <span className="earn">You earned this certificate</span>
                </div>
                <a
                  target="_blank"
                  href="https://sff.apixoxygen.com/certificate/${available_cert_id}"
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
                    href="https://sff.apixoxygen.com/certificate/${available_cert_id}"
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
          </div>
          <WelcomeMessage courseId={courseId} />
          {rootCourseId && (
            <>
              <div className="row w-100 m-0 mb-3 justify-content-end">
                <div className="col-12 col-sm-auto p-0">
                  <Button
                    variant="outline-primary"
                    block
                    onClick={() => {
                      setExpandAll(!expandAll);
                    }}
                  >
                    {expandAll
                      ? intl.formatMessage(messages.collapseAll)
                      : intl.formatMessage(messages.expandAll)}
                  </Button>
                </div>
              </div>
              <ol className="list-unstyled">
                {courses[rootCourseId].sectionIds.map((sectionId) => (
                  <Section
                    key={sectionId}
                    courseId={courseId}
                    defaultOpen={sections[sectionId].resumeBlock}
                    expand={expandAll}
                    section={sections[sectionId]}
                  />
                ))}
              </ol>
            </>
          )}
        </div>
        {rootCourseId && (
          <div className="col col-12 col-md-4">
            <ProctoringInfoPanel courseId={courseId} username={username} />
            {courseGoalToDisplay && goalOptions && goalOptions.length > 0 && (
              <UpdateGoalSelector
                courseId={courseId}
                goalOptions={goalOptions}
                selectedGoal={courseGoalToDisplay}
                setGoalToDisplay={(newGoal) => {
                  setCourseGoalToDisplay(newGoal);
                }}
                setGoalToastHeader={(newHeader) => {
                  setGoalToastHeader(newHeader);
                }}
              />
            )}
            <CourseTools courseId={courseId} />
            {/** [MM-P2P] Experiment (conditional) */}
            {MMP2P.state.isEnabled ? (
              <MMP2PFlyover isStatic options={MMP2P} />
            ) : (
              <UpgradeNotification
                offer={offer}
                verifiedMode={verifiedMode}
                accessExpiration={accessExpiration}
                contentTypeGatingEnabled={
                  datesBannerInfo.contentTypeGatingEnabled
                }
                upsellPageName="course_home"
                userTimezone={userTimezone}
                shouldDisplayBorder
                timeOffsetMillis={timeOffsetMillis}
                courseId={courseId}
                org={org}
              />
            )}
            <CourseDates
              courseId={courseId}
              /** [MM-P2P] Experiment */
              mmp2p={MMP2P}
            />
            <CourseHandouts courseId={courseId} />
          </div>
        )}
      </div>
    </>
  );
}

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
