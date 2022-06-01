import React, { useEffect } from "react";
import { getConfig } from '@edx/frontend-platform';
import refreshImage from "../course/celebration/assets/refresh.png";
// import refreshImage from '../course/celebration/assets/claps_456x328.gif';
function CertificateReceiveAlert({
  availableCertId,
  checked,
  courseId,
  changedGrade,
  postGradeHandler
}) {

  const certUrl = `https://stg-certificate.apixoxygen.com/certificate/${availableCertId}`;
  const baseUrl = getConfig().LMS_BASE_URL;
  const progressUrl = `${baseUrl}/learning/course/${courseId}/progress`;

    const closeAlertBox = () =>{
        
        postGradeHandler();
    }

  useEffect(() => {
    if(!checked && availableCertId){
        document.getElementById('root').append(document.getElementById('alert-overlay'));
        document.getElementById('alert-overlay').style.display="";
    }else{
        document.getElementById('alert-overlay').style.display="none";
    }
  });

  return (
    <div className="alert-overlay" id="alert-overlay" style={{display:'none'}}>
         <div className="alert-wrapper" id="certificate-receive-alert" >
       <span onClick={()=>postGradeHandler()}>Close</span>
       <br/>
       <img src={refreshImage} alt="Refresh Image" />
       <br/>
       <p>Congratulation, You got {changedGrade}</p>
       <div className="btn-group" onClick={()=>postGradeHandler()}>
         <a href={certUrl} className="view-cert">View Certificate</a>
         <a href={progressUrl} className="check-progress">Check Progress</a>
       </div>
   </div>
    </div>

  );
}

export default CertificateReceiveAlert;
