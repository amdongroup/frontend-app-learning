import React from "react";
import { useSelector } from "react-redux";

import { getAuthenticatedUser } from "@edx/frontend-platform/auth";
import { injectIntl, intlShape } from "@edx/frontend-platform/i18n";
import { Button } from "@edx/paragon";

import { useModel } from "../../generic/model-store";

import messages from "./messages";

function ProgressHeader({ intl }) {
  const { courseId, targetUserId } = useSelector((state) => state.courseHome);

  const { administrator, userId } = getAuthenticatedUser();

  const { studioUrl, username } = useModel("progress", courseId);

  const viewingOtherStudentsProgressPage =
    targetUserId && targetUserId !== userId;

  const pageTitle = viewingOtherStudentsProgressPage
    ? intl.formatMessage(messages.progressHeaderForTargetUser, { username })
    : intl.formatMessage(messages.progressHeader);

  const overall_percentage = 0;
  const available_cert_id = "";

  window.addEventListener("scroll", (event) => {
    let scroll = this.scrollY;
    console.log(scroll);
    if (scroll >= 230) {
      document.getElementById("apo-progress-wrapper").style.position = "fixed";
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

  return (
    <>
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
              src="/static/oxygen-theme/images/refresh.png"
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
                ${overall_percentage}%
              </span>
            </div>
            <div className="refresh-part" style={{ marginLeft: "6px" }}>
              <img
                src="/static/oxygen-theme/images/refresh.png"
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
      <div className="row w-100 m-0 mt-3 mb-4 justify-content-between">
        <h1>{pageTitle}</h1>
        {administrator && studioUrl && (
          <Button
            variant="outline-primary"
            size="sm"
            className="align-self-center"
            href={studioUrl}
          >
            {intl.formatMessage(messages.studioLink)}
          </Button>
        )}
      </div>
    </>
  );
}

ProgressHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ProgressHeader);
