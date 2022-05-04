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
      <div class="apo-progress-wrapper" id="apo-progress-wrapper">
        <div id="apo-progress">
          <div class="progress-part">
            <span>Your current grade</span>
            <div class="progress">
              <div
                class="progress-bar"
                id="progress-value"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div class="passmark passmark-fix"></div>
          </div>
          <div class="percent-part">
            <span class="apo-progress-percent">{overall_percentage}%</span>
          </div>
          <div class="desc-part" id="under-pass">
            <div class="top d-flex">
              <div class="passmark" style="position: relative;"></div>
              <span class="desc-percent">Passing grade 60%</span>
            </div>
            <span class="desc-percent-bottom">Earn 60% to get Certificate</span>
          </div>
          <div class="desc-part" id="over-pass" style="display: none;">
            <div class="top d-flex">
              <span class="earn">You earned this certificate</span>
            </div>
            <a
              target="_blank"
              href="https://sff.apixoxygen.com/certificate/${available_cert_id}"
              class="view-cert"
              id="view-cert"
            >
              View certificate
            </a>
            <a class="no-cert" id="no-cert">
              View certificate
            </a>
          </div>
          <div class="refresh-part">
            <img
              src="/static/oxygen-theme/images/refresh.png"
              alt=""
              id="refresh-btn"
            />
          </div>
        </div>
        <div id="apo-progress-mobile">
          <div class="top d-flex align-item-start">
            <div class="progress-part">
              <span>Your current progress</span>
            </div>
            <div class="percent-part">
              <span class="apo-progress-percent">${overall_percentage}%</span>
            </div>
            <div class="refresh-part" style="margin-left: 6px;">
              <img
                src="/static/oxygen-theme/images/refresh.png"
                alt=""
                id="refresh-btn-mobile"
              />
            </div>
          </div>
          <div class="mid d-flex">
            <div class="progress">
              <div
                class="progress-bar"
                id="progress-value-mobile"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div class="passmark passmark-fix"></div>
          </div>
          <div class="bottom d-flex" style="margin-top: 8px;">
            <div class="desc-part" id="under-pass-mobile">
              <div class="top d-flex">
                <div class="passmark" style="position: relative;"></div>
                <span class="desc-percent">Passing grade 60%</span>
              </div>
              <span class="desc-percent-bottom">
                Earn 60% to get Certificate
              </span>
            </div>
            <div class="desc-part" id="over-pass-mobile" style="display: none;">
              <div class="top d-flex">
                <span class="earn">You earned this certificate</span>
              </div>
              <a
                target="_blank"
                href="https://sff.apixoxygen.com/certificate/${available_cert_id}"
                class="view-cert"
                id="view-cert-mobile"
              >
                View certificate
              </a>
              <a class="no-cert" id="no-cert-mobile">
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
