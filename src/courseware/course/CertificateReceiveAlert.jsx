import React, { useEffect } from "react";
import { getConfig } from '@edx/frontend-platform';
import Cancel from "../course/celebration/assets/cancel_l.png";
import Pass from "../course/celebration/assets/grade_pass.png";
import Certificate from "../course/celebration/assets/grade_certificate.png";

function CertificateReceiveAlert({
  availableCertId,
  courseId,
  isPass,
  overallPercentage,
  postGradeHandler
}) {

  const certUrl = `https://stg-certificate.apixoxygen.com/certificate/${availableCertId}`;
  const baseUrl = getConfig().LMS_BASE_URL;
  const progressUrl = `${baseUrl}/learning/course/${courseId}/progress`;

  const appendOverlay = () =>{
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.id = 'overlay';
    if(document.getElementsByClassName('overlay').length === 0){
      document.getElementById('root').append(overlay);
      document.body.style.overflow = 'hidden';
    }
  }

  useEffect(()=>{
    appendOverlay()
  },[])
    
  return (
    <div className="alert-wrapper" id="certificate-receive-alert" >
      <img className="box-close" onClick={()=>postGradeHandler()} src={Cancel} alt="Refresh Image" />
      {isPass ? 
        (<div className="d-flex flex-column align-items-center box-content">
          <span className="h1-strong">Congratulations!</span>
          <span className="body-l mb-51" >You have earned a certificate.</span>
          <span className="body-xl mb-17">Keep it up! You will earn a Distinction Certificate when you get {overallPercentage}% </span>
          <img className="pass-img" src={Pass} alt="" />
          <div className="btn-group" onClick={()=>postGradeHandler()}>
            <a href={progressUrl} className="box-btn">View my progress</a>
            <a href={certUrl} className="box-btn">View certificate</a>
          </div>
        </div>) :
        (<div className="d-flex flex-column align-items-center box-content">
          <span className="h1-strong">Congratulations!</span>
          <span className="body-l mb-51 box-text">Your certificate has been upgraded to Distinction certificate.</span>
          <img className="cert-img" src={Certificate} alt="" />
          <div className="box-btn-group" onClick={()=>postGradeHandler()}>
            <a href={progressUrl} className="box-btn">View my progress</a>
            <a href={certUrl} className="box-btn">View certificate</a>
          </div>
        </div>)
      }
    </div>
  );
}

export default CertificateReceiveAlert;
