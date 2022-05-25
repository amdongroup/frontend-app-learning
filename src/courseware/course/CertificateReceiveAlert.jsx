import React, { useEffect } from "react";
import refreshImage from "../course/celebration/assets/refresh.png";
import { getConfig } from '@edx/frontend-platform';
// import refreshImage from '../course/celebration/assets/claps_456x328.gif';
function CertificateReceiveAlert({
  availableCertId,
  overallPercentage,
  passingPoint,
  checked,
  courseId
}) {

    const certLink = `https://stg-certificate.apixoxygen.com/certificate/${availableCertId}`;
    const progressLink = getConfig().LMS_BASE_URL+`learning/course/${courseId}/progress`;

    const closeAlertBox = () =>{
        document.getElementById('certificate-receive-alert').style.display="none";
    }

  useEffect(() => {
    // if(!checked && availableCertId){
    //     document.getElementById('certificate-receive-alert').style.display="";
    // }else{
    //     document.getElementById('certificate-receive-alert').style.display="none";
    // }

    if(!checked){
        document.getElementById('certificate-receive-alert').style.display="";
    }else{
        document.getElementById('certificate-receive-alert').style.display="none";
    }
  });

  return (
   <div className="alert-wrapper" id="certificate-receive-alert" style={{display:'none'}}>
       <span onClick={closeAlertBox}>Close</span>
       <img src={refreshImage} alt="" />
        <p>Congratulations! You have completed the course.</p>
        <div className="btn-group">
            <a href={certLink} className="view-cert">View Cert</a>
            <a href={progressLink} className="progress">Progress</a>
        </div>
   </div>
  );
}

export default CertificateReceiveAlert;
