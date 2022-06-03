import React, { useEffect, useState } from "react";
import { getConfig } from '@edx/frontend-platform';
import refreshImage from "../course/celebration/assets/refresh.png";
import {getUser} from '../../experiments/mm-p2p/utils'
import Cancel from "../course/celebration/assets/cancel_l.png";
import Pass from "../course/celebration/assets/grade_pass.png";
import Certificate from "../course/celebration/assets/grade_certificate.png";
import NormalPass from "../course/celebration/assets/claps_456x328.gif"
import { max } from "lodash";

function CertificateReceiveAlert({
  availableCertId,
  progress_data,
  courseId,
}) {

  const prefixApps = (baseUrl)=>{
    let array = baseUrl.split("//")
    let fixedUrl = array[0]+"//apps."+array[1]
    return fixedUrl
  }

  const authenticatedUser = getUser()
  const certUrl = `https://stg-certificate.apixoxygen.com/certificate/${availableCertId}`;
  const baseUrl = getConfig().LMS_BASE_URL;
  const progressUrl = `${prefixApps(baseUrl)}/learning/course/${courseId}/progress`;
  const apiKey=process.env.AMDON_API_KEY;

  const [dist_percent,setDist_percent] = useState(0);
  const [isPass,setIsPass] = useState(true);
  const [showBox,setShowBox] = useState(false);
  const [gradeArray,setGradeArray] = useState([]);
  const [normal,setNormal] = useState(false);

  

  const postGradeHandler = async ()=>{
    document.getElementById('certificate-receive-alert').style.display="none";
    console.log('call api with grade ',gradeArray)
    let postGradeApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades`
    const body ={
      "user_id" : authenticatedUser.username,
      "course_id":courseId,
      "grade" : gradeArray
    }
    const response = await fetch(postGradeApiUrl,{
      method: 'POST',
      headers: new Headers({'apikey':apiKey,'content-type': 'application/json'}),
      body: JSON.stringify(body)
    })
    // removeElementsByClass('overlay')
    // document.body.style.overflow = 'auto';
    console.log('post api response ',response)
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

    const isNormal = (gradeRange)=>{
      let array = Object.keys(gradeRange)
      if(array.length === 1){
        setNormal(true)
        return true
      }
      return false
    }

    // call check api whether to show pass or change grade
    let checkApiUrl = `${process.env.AMDON_BASE_API_URL}/api/course-grades?user_id=${authenticatedUser.username}&course_id=${courseId}`
    
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
            let minGrade = minGradeArr.sort().pop()

            let maxGradeArr = Object.keys(gradeRange)
            let maxGrade = maxGradeArr.sort().shift()

            let minPointArr = Object.keys(gradeRange)
            let minPoint = minPointArr.sort().pop()

            let maxPointArr = Object.keys(gradeRange)
            let maxPoint = maxPointArr.sort().shift()

            let currentGrade = progress_data.course_grade.letter_grade

            if(progress_data.grading_policy.grade_range){ //prevent error log when api calling
              prepareDistPercent()
            }

            if(isNormal(gradeRange)){

            }else{
              if(gradeData.length == 0 ){
                if(isMaxGrade(currentGrade,gradeData,maxGrade,minGrade) || isMinGrade(currentGrade,minGrade)){
                  setShowBox(true)
                  let array = []
                  if(isMaxGrade(currentGrade,gradeData,maxGrade,minGrade)){
                    array.push(maxGrade)
                    array.push(minGrade)
                    setGradeArray(array)
                  }else if(isMinGrade(currentGrade,minGrade)){
                    array.push(minGrade)
                    setGradeArray(array)
                  }
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
            }
            
            
        });
      })
    }

    getApiGrade()
    // call check api whether to show pass or change grade

  },[progress_data]);

  return (
    <>
      {showBox && !normal && (
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
                 <a href={certUrl} target="_blank" className="box-btn">View certificate</a>
               </div>
             </div>) :
             (<div className="d-flex flex-column align-items-center box-content">
               <span className="h1-strong">Congratulations!</span>
               <span className="body-l mb-51 box-text">Your certificate has been upgraded to Distinction certificate.</span>
               <img className="cert-img" src={Certificate} alt="" />
               <div className="box-btn-group" onClick={()=>postGradeHandler()}>
                 <a href={progressUrl} className="box-btn">View my progress</a>
                 <a href={certUrl} target="_blank" className="box-btn">View certificate</a>
               </div>
             </div>)
           }
         </div>
      )}
      {
        showBox && normal && (
          <div className="alert-wrapper" id="certificate-receive-alert" >
          <img className="box-close" onClick={()=>postGradeHandler()} src={Cancel} alt="Refresh Image" />
          <div className="d-flex flex-column align-items-center box-content">
            <span className="h1-strong">Congratulations!</span>
            <span className="body-l mb-51" >You have earned a certificate.</span>
            <img className="pass-img" src={NormalPass} alt="" />
            <div className="box-btn-group" onClick={()=>postGradeHandler()}>
              <a href={progressUrl} className="box-btn">View my progress</a>
              <a href={certUrl} target="_blank" className="box-btn">View certificate</a>
            </div>
          </div>
        </div>
        )
      }
    </>

  );
}

export default CertificateReceiveAlert;
