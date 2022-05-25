import React, { useEffect } from "react";
import refreshImage from "../course/celebration/assets/refresh.png";
// import refreshImage from '../course/celebration/assets/claps_456x328.gif';
function CertificateReceiveAlert({
  availableCertId,
  overallPercentage,
  passingPoint,
  checked
}) {

    const closeAlertBox = () =>{
        document.getElementById('certificate-receive-alert').style.display="none";
    }

  useEffect(() => {
    if(!checked && availableCertId){
        document.getElementById('certificate-receive-alert').style.display="";
    }else{
        document.getElementById('certificate-receive-alert').style.display="none";
    }
  });

  return (
   <div className="alert-wrapper" id="certificate-receive-alert" style={{display:'none'}}>
       This is certificate receive notification box.
       <span onClick={closeAlertBox}>Click here to close!</span>
   </div>
  );
}

export default CertificateReceiveAlert;
