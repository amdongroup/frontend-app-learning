import React, { useEffect } from "react";
import { getConfig } from '@edx/frontend-platform';
import refreshImage from "../course/celebration/assets/refresh.png";
// import refreshImage from '../course/celebration/assets/claps_456x328.gif';
function CertificateReceiveAlert({
  availableCertId,
  overallPercentage,
  passingPoint,
  checked,
  courseId,
  changedGrade,
  postGrade
}) {

  const certUrl = `https://stg-certificate.apixoxygen.com/certificate/${availableCertId}`;
  const baseUrl = getConfig().LMS_BASE_URL;
  const progressUrl = `${baseUrl}/learning/course/${courseId}/progress`;

    const closeAlertBox = () =>{
        document.getElementById('certificate-receive-alert').style.display="none";
        postGrade;
    }

  useEffect(() => {
    if(!checked){
        document.getElementById('certificate-receive-alert').style.display="";
    }else{
        document.getElementById('certificate-receive-alert').style.display="none";
    }
  });

  return (
   <div className="alert-wrapper" id="certificate-receive-alert" style={{display:'none'}}>
       <span onClick={closeAlertBox}>Close</span>
       <img src={refreshImage} alt="Refresh Image" />
       <p>Congratulation, You got {changedGrade}</p>
       <div className="btn-group" onClick={closeAlertBox}>
         <a href={certUrl} className="view-cert">View Certificate</a>
         <a href={progressUrl} className="check-progress">Check Progress</a>
       </div>
   </div>
  );
}

export default CertificateReceiveAlert;
