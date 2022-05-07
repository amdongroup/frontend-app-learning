import React, { useEffect } from 'react';
//import refreshImage from '../../../generic/assets/refresh.png';

function CourseGradeProgress({
  availableCertId,
  overallPercentage
}) {

  useEffect(() => {

       window.addEventListener("scroll", (event) => {
      let scroll = window.scrollY || window.pageYOffset;
      console.log(scroll);
      if (scroll >= 230) {
        document.getElementById("apo-progress-wrapper").style.position =
          "fixed";
        document.getElementById("apo-progress-wrapper").style.zIndex = "999";
        document.getElementById("apo-progress-wrapper").style.top = "0";
        document.getElementById("apo-progress-wrapper").style.left = "0";
        document.getElementById("apo-progress-wrapper").style.background =
          "rgba(0, 0, 0, 0.1)";
        document.getElementById("apo-progress-wrapper").style.border = "none";
        document.getElementById("apo-progress-wrapper").style.borderRadius =
          "0px";
      } else {
        document.getElementById("apo-progress-wrapper").style.position = "";
        document.getElementById("apo-progress-wrapper").style.zIndex = "";
        document.getElementById("apo-progress-wrapper").style.top = "";
        document.getElementById("apo-progress-wrapper").style.background =
          "transparent";

        document.getElementById("apo-progress-wrapper").style.border = "none";
        document.getElementById("apo-progress-wrapper").style.borderRadius =
          "0px";
      }
    });

    if (overallPercentage >= 60) {
      document.getElementById("under-pass").style.display = "none";
      document.getElementById("over-pass").style.display = "";
      document.getElementById("under-pass-mobile").style.display = "none";
      document.getElementById("over-pass-mobile").style.display = "";
    } else {
      document.getElementById("under-pass-mobile").style.display = "";
      document.getElementById("over-pass-mobile").style.display = "none";
    }

    if (availableCertId) {
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
    overallPercentage + "%";

    document
      .getElementById("refresh-btn-mobile")
      .addEventListener("click", function () {
        location.reload();
      });
    document.getElementById("progress-value-mobile").style.width =
    overallPercentage + "%";

  })
  
  return(
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
            <span className="apo-progress-percent">{overallPercentage}%</span>
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
              href= {`https://exts-dev.stemwerkz.org/open-edx-cert/${availableCertId}`}
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
              src="../../../generic/assets/refresh.png"
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
                {overallPercentage}%
              </span>
            </div>
            <div className="refresh-part" style={{ marginLeft: "6px" }}>
              <img
                src="../../../generic/assets/refresh.png"
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
                href={`https://exts-dev.stemwerkz.org/open-edx-cert/${availableCertId}`}
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
  )

}

export default CourseGradeProgress