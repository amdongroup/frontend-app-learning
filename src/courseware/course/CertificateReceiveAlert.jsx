import React, { useEffect, useState } from "react";
import { getConfig } from '@edx/frontend-platform';
import refreshImage from "../course/celebration/assets/refresh.png";
import {getUser} from '../../experiments/mm-p2p/utils'
import Cancel from "../course/celebration/assets/cancel_l.png";
import Pass from "../course/celebration/assets/grade_pass.png";
import Certificate from "../course/celebration/assets/grade_certificate.png";

function CertificateReceiveAlert({
  availableCertId,
  progress_data,
  courseId,
}) {

  const authenticatedUser = getUser()
  const certUrl = `https://stg-certificate.apixoxygen.com/certificate/${availableCertId}`;
  const baseUrl = getConfig().LMS_BASE_URL;
  const progressUrl = `${baseUrl}/learning/course/${courseId}/progress`;
  const apiKey=process.env.AMDON_API_KEY;

  const [dist_percent,setDist_percent] = useState(0);
  const [isPass,setIsPass] = useState(true);

  const postGradeHandler = ()=>{
    document.getElementById('certificate-receive-alert').style.display="none";
    console.log('call api')
  }

  useEffect(() => {
    const prepareDistPercent = () =>{
      let maxGradeArr = Object.values(progress_data.grading_policy.grade_range)
      let maxGrade = Math.max(...maxGradeArr)
      setDist_percent(Math.round(maxGrade * 100))
    }

    

    // call check api whether to show pass or change grade
    let checkApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades?user_id=${authenticatedUser.username}&course_id=${encodeURIComponent(courseId)}`
    
    const isChecked = async () =>{
      fetch(checkApiUrl,{
        method: 'GET',
        headers: new Headers({"apikey":apiKey,'content-type': 'application/json'}),
      }).then(res=>{
        console.log('is Checked api called',res)
        res.json().then((data) => {
            console.log('data',data);
            prepareDistPercent()
            // if(data.length == 0){
            //   seenBox_Ref.current = false
            // }
            // else{
            //   //compare grade
            //   console.log('compare ',changedGrade , data[0])
            //   if(changedGrade && data.indexOf(changedGrade) != -1){
            //     seenBox_Ref.current = false
            //   }else{
            //     seenBox_Ref.current = true
            //   }
            // }
        });
      })

    }

    isChecked()
    // call check api whether to show pass or change grade

  },[progress_data]);

  return (
   <div className="alert-wrapper" id="certificate-receive-alert" >
      <img className="box-close" onClick={()=>postGradeHandler()} src={Cancel} alt="Refresh Image" />
      {isPass ? 
        (<div className="d-flex flex-column align-items-center box-content">
          <span className="h1-strong">Congratulations!</span>
          <span className="body-l mb-51" >You have earned a certificate.</span>
          <span className="body-xl mb-17">Keep it up! You will earn a Distinction Certificate when you get {dist_percent}% </span>
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
