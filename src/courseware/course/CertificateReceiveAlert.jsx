import React, { useEffect, useState } from "react";
import { getConfig } from '@edx/frontend-platform';
import refreshImage from "../course/celebration/assets/refresh.png";
import {getUser} from '../../experiments/mm-p2p/utils'
import Cancel from "../course/celebration/assets/cancel_l.png";
import Pass from "../course/celebration/assets/grade_pass.png";
import Certificate from "../course/celebration/assets/grade_certificate.png";
import { max } from "lodash";

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
  const [showBox,setShowBox] = useState(false);
  const [gradeArray,setGradeArray] = useState([]);

  const postGradeHandler = ()=>{
    document.getElementById('certificate-receive-alert').style.display="none";
    console.log('call api with grade ',gradeArray)
  }

  useEffect(() => {
    const prepareDistPercent = () =>{
      let maxGradeArr = Object.values(progress_data.grading_policy.grade_range)
      let maxGrade = Math.max(...maxGradeArr)
      setDist_percent(Math.round(maxGrade * 100))
    }

    const gradeIsNew = (currentGrade,apiGrade) =>{
      if(apiGrade.indexOf(currentGrade) > -1){
        return true
      }
      return false
    }
    
    const checkJump = (apiData,maxGrade,minGrade) =>{
      let array = []
      if(apiData.indexOf(minGrade) > -1){
        array.push(maxGrade)
        setGradeArray(array)
      }else{
        array.push(maxGrade)
        array.push(minGrade)
        setGradeArray(array)
      }
    }

    const isMaxGrade = (currentGrade,apiData,maxGrade,minGrade) =>{
      console.log('maxGrade');
      console.log(maxGrade,currentGrade);
      if(maxGrade === currentGrade){
        setIsPass(false)
        checkJump(apiData,maxGrade,minGrade)
        return true
      }
      return false
    }

    const isMinGrade = (currentGrade,minGrade) =>{
      console.log('minGrade');
      console.log(minGrade,currentGrade);
      if(minGrade === currentGrade){
        setIsPass(true)
        return true
      }
      return false
    }

    const lessThanMaxGrade = (currentGrade,maxPoint) =>{
      if(currentGrade < maxPoint){
        return true
      }
      return false
    }

    const greaterThanMinGrade = (currentGrade,minPoint) =>{
      if(currentGrade > minPoint){
        return true
      }
      return false
    }

    // call check api whether to show pass or change grade
    let checkApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades?user_id=${authenticatedUser.username}&course_id=${encodeURIComponent(courseId)}`
    
    const getApiGrade = async () =>{
      fetch(checkApiUrl,{
        method: 'GET',
        headers: new Headers({"apikey":apiKey,'content-type': 'application/json'}),
      }).then(res=>{
        console.log('is Checked api called',res)
        res.json().then((gradeData) => {
            console.log('data',gradeData);
            let gradeRange = progress_data.grading_policy.grade_range

            let minGradeArr = Object.keys(gradeRange)
            let minGrade = minGradeArr.sort().shift()

            let maxGradeArr = Object.keys(gradeRange)
            let maxGrade = maxGradeArr.sort().pop()

            let minPointArr = Object.keys(gradeRange)
            let minPoint = minPointArr.sort().shift()

            let maxPointArr = Object.keys(gradeRange)
            let maxPoint = maxPointArr.sort().pop()

            let currentGrade = progress_data.course_grade.letter_grade

            if(progress_data.grading_policy.grade_range){ //prevent error log when api calling
              prepareDistPercent()
            }
            
            if(gradeData.length == 0 ){
              if(isMaxGrade(currentGrade,gradeData,maxGrade,minGrade) || isMinGrade(currentGrade,minGrade)){
                setShowBox(true)
              }else if(lessThanMaxGrade(currentGrade,maxPoint) && greaterThanMinGrade(currentGrade,minPoint)){
                let array = []
                array.push(minGrade)
                setGradeArray(array)
                setShowBox(true)
              }else{
                setShowBox(false)
              }
            }else if(gradeIsNew(currentGrade,gradeData)){
              if(isMaxGrade(currentGrade,gradeData,maxGrade,minGrade) || isMinGrade(currentGrade,minGrade)){
                setShowBox(true)
              }else{
                setShowBox(false)
              }
            }
        });
      })
    }

    getApiGrade()
    // call check api whether to show pass or change grade

  },[progress_data]);

  return (
    <>
      {showBox && (
           <div className="alert-wrapper" id="certificate-receive-alert" >
           <img className="box-close" onClick={()=>postGradeHandler()} src={Cancel} alt="Refresh Image" />
           {isPass ? 
             (<div className="d-flex flex-column align-items-center box-content">
               <span className="h1-strong">Congratulations!</span>
               <span className="body-l mb-51" >You have earned a certificate.</span>
               <span className="body-xl mb-17">Keep it up! You will earn a Distinction Certificate when you get {dist_percent}% </span>
               <img className="pass-img" src={Pass} alt="" />
               <div className="box-btn-group" onClick={()=>postGradeHandler()}>
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
      )}
    </>

  );
}

export default CertificateReceiveAlert;
