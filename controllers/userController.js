var UserModel = require('../model/users')
var UserAccount = require('../model/userAccount')
var Employment = require('../model/employment')
// const leaveType =require('../model/leaveType')
var Qualification = require("../model/qualificationExperience")
var leaveRequest = require("../model/leaveRequest")
var UserleaveType = require('../model/leaveType')
var user_report = require("../model/user_report")
var employType = require("../model/employType")
var path = require("path");
var multer = require('multer');
var sharp = require('sharp')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var config = require('../config/config')
const UserProfile = require('../model/userProfile')



class UserController {



  //for userRegistration 
  static userRegistration = async (req, res) => {
    console.log(req.body)
    const totalLeave = await employType.findOne({ _id: req.body.emplType })
    console.log(totalLeave.totalleave)
    var total = totalLeave.totalleave

    // return
    const userData = await UserModel.findOne({ _id: req.user._id })
    console.log(userData.role)
    const admin = userData.role
    const { username, fname, password, password_confirmation, lastname, title, company, email, role, emplType } = req.body

    if (admin === 'admin') {



      const user = await UserModel.findOne({ email: email })

      if (user) {
        res.send({ "status": "failed", "message": "Email already exists" })
      } else {
        if (username && email && password && password_confirmation) {
          if (password === password_confirmation) {
            try {

              const doc = new UserModel({
                fname: fname,
                lastname: lastname,
                username: username,
                company: company,
                title: title,
                email: email,
                password: password,
                role: role,
                emptype_id: emplType,
                empleave: total

              })
              console.log("doc===", doc)
              await doc.save()
              const saved_user = await UserModel.findOne({ email: email })
              console.log(saved_user._id)
              const currentUser_id = saved_user._id

              //create user report
              const rep = new user_report({
                new_user_id: currentUser_id,
                report_to_id: req.user._id,
                assign_by_id: req.user._id

              })
              await rep.save()
              // for leaves

              const lev = new UserleaveType({
                leavetype: "probation",
                balance: total,
                availed: 0,
                available: total,
                pending: 0,
                user_id: currentUser_id

              })
              console.log(lev)
              await lev.save()
              // Generate JWT Token
              const token = jwt.sign({ userID: saved_user._id }, config.secret, { expiresIn: '5d' })
              res.status(201).send({ "status": "success", "message": "Registration Success", "token": token, "status": 201 })
            } catch (error) {
              // console.log(error)
              // res.send({ "status": "failed", "message": "Unable to Register" })
              res.status(500).send(error.message);
            }
          } else {
            res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
          }
        } else {
          res.status(401).send({ "status": "failed", "message": "All fields are required", "status": 400 })
        }
      }
    } else {

      res.send({ "status": "failed", "message": "only Admin can add " })

    }


  }

  // for userLogin
  static userLogin = async (req, res) => {

    try {
      const { email, password } = req.body
      console.log(req.body)
      if (email && password) {
        const user = await UserModel.findOne({ email: email })
        console.log(user.password)
        if (user != null) {
          const isMatch = await bcrypt.compare(req.body.password, user.password);
          console.log(isMatch)
          if ((user.email === email) && isMatch) {
            // Generate JWT Token
            const token = jwt.sign({ userID: user._id, username: user.username }, config.secret, { expiresIn: '5d' })
            res.status(201).send({ "status": "success", "message": "Login Success", "token": token, "status": 201 })
          } else {
            res.status(401).send({ "status": "failed", "message": "Email or Password is not Valid", "status": 401 })
          }
        } else {
          res.status(401).send({ "status": "failed", "message": "You are not a Registered User", "status": 401 })
        }
      } else {
        res.status(400).send({ "status": "failed", "message": "All Fields are Required", "status": 400 })
      }
    } catch (error) {
      console.log(error)
      res.status(401).send({ "status": "failed", "message": "Unable to Login", "status": 401 })
    }
  }




  // for changeUserPassword

  static changeUserPassword = async (req, res) => {

    const user = await UserModel.findOne({ _id: req.user._id })
    console.log(user.password)

    if (user != null) {
      const isMatch = await bcrypt.compare(req.body.current_password, user.password);

      if (isMatch) {

        console.log(req.user._id)
        const { password_confirmation, password, current_password } = req.body
        if (password && password_confirmation) {

          if (password === password_confirmation) {
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)
            await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })

            res.status(201).send({ "status": "success", "message": "password change successfully ", "status": 201 })

          } else {
            res.status(401).send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match", "status": 401 })

          }

        } else {
          res.status(400).send({ "status": "failed", "message": "All field are required ", "status": 400 })

        }

      }
      else {

        res.status(401).send({ "status": "failed", "message": "invalid password", "status": 401 })
      }

    }
    else {

      res.status(404).send({ "status": "failed", "message": "user not found", "status": 404 })

    }

  }




  // // for changeUserProfile

  // static userProfile = async (req, res) => {
  //   console.log(req.user._id)

  //   const profile = await UserProfile.findOne({ user_id: req.user.id })

  //   console.log(profile)

  //   const { img, salutation, fatherName, gender, maritalStatus, religion, nationality, bloodgroup, dob } = req.body
  //   if (!profile) {

  //     try {

  //       const doc = new UserProfile({
  //         img: img,
  //         salutation: salutation,
  //         fatherName: fatherName,
  //         gender: gender,
  //         maritalStatus: maritalStatus,
  //         religion: religion,
  //         nationality: nationality,
  //         bloodgroup: bloodgroup,
  //         dob: dob,
  //         user_id: req.user.id
  //       })
  //       await doc.save()
  //       res.status(201).send({ "status": "success", "message": "Profile update  Successfully", "status": 201 })
  //     } catch (error) {

  //       res.status(500).send(error.message);
  //     }

  //   }
  //   else {

  //     UserProfile.updateOne({ user_id: req.user.id }, { $set: req.body }, (error, data) => {

  //       if (error) {
  //         res.status(400).send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 400 })
  //       }
  //       else {

  //         res.status(201).send({ "status": "success", "message": "Profile update  Successfully", "status": 201 })
  //       }

  //     })


  //   }

  // }


  //imageUpload
  static imageUpload = async (req, res) => {
    console.log(req.file)

    // for resized image 

    const array = [100, 250, 550]
    const pathArray = [];
    for (let i = 0; i < array.length; i++) {
      const { filename: profileImage } = req.file;
      await sharp(req.file.path)
        .resize(array[i], array[i])
        .jpeg({ quality: 90 })
        .toFile(
          path.resolve('resized', req.file.destination, array[i].toString(), profileImage)
        )
      const first = path.resolve('resized', req.file.destination, array[i].toString(), profileImage)
      pathArray.push(first)
    }
    pathArray.push(req.file.path)
    console.log(pathArray)

    try {
      const result = {
        pathArray

      }
      res.status(200).send(result)
    } catch (e) {
      console.log("hello")
      res.status(500).send(e.message)
    }
  }



  // for changeUserProfile  

  static quickcontact = async (req, res) => {
    console.log(req.user._id)

    const { img, salutation, fatherName, gender, maritalStatus, religion, nationality, bloodgroup, dob } = req.body
    console.log(maritalStatus)
    var doc = {
      img: img,
      salutation: salutation,
      fatherName: fatherName,
      gender: gender,
      maritalStatus: maritalStatus,
      religion: religion,
      nationality: nationality,
      bloodgroup: bloodgroup,
      dob: dob

    }

    UserModel.updateOne({ _id: req.user.id }, { $set: { 'userProfile': doc } }, (error, data) => {

      if (error) {
        res.status(400).send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 400 })
      }
      else {

        res.status(201).send({ "status": "success", "message": "Profile update  Successfully", "status": 201 })
      }

    })


  }



  //userProfile

  static userProfile = async (req, res) => {
    console.log(req.user._id)
    const pathArray = ['image', 'image', 'image2'];
    // // for resized image 

    // const array = [100, 250, 550]
    // const pathArray = [];



    // for (let i = 0; i < array.length; i++) {
    //   const { filename: profileImage } = req.file;
    //   await sharp(req.file.path)
    //     .resize(array[i], array[i])
    //     .jpeg({ quality: 90 })
    //     .toFile(
    //       path.resolve('resized', req.file.destination, array[i].toString(), profileImage)
    //     )
    //   const first = path.resolve('resized', req.file.destination, array[i].toString(), profileImage)
    //   pathArray.push(first)
    // }



    // var religionImage = req.file.path;
    var religionImage = 'image';
    console.log(req.body.maritalStatus)

    const { mobile, quickEmail, lineNumber, CNIC, passportNo, salutation, fatherName, gender, maritalStatus, religion, nationality, bloodgroup, dob
      , CNICImage, CNICExpire, passportImage, passportExpire, licenseImage, licenseNo, liceseExpire } = req.body

    UserModel.updateOne(
      { _id: req.user.id },
      {
        $set: {
          "quickContact.email": quickEmail,
          "quickContact.lineNumber": lineNumber,
          "quickContact.mobile": mobile,
          "IdentityCard.CNIC": CNIC,
          "IdentityCard.CNICImage": CNICImage,
          "IdentityCard.CNICExpire": CNICExpire,
          "passport.passportNo": passportNo,
          "passport.passportImage": passportImage,
          "passport.passportExpire": passportExpire,
          "userProfile.0.img.profile_pic.100": pathArray[0],
          "userProfile.0.img.profile_pic.250": pathArray[1],
          "userProfile.0.img.profile_pic.550": pathArray[2],
          "userProfile.0.img.profile_pic.original": religionImage,
          "userProfile.0.salutation": salutation,
          "userProfile.0.fatherName": fatherName,
          "userProfile.0.gender": gender,
          "userProfile.0.maritalStatus": maritalStatus,
          "userProfile.0.religion": religion,
          "userProfile.0.nationality": nationality,
          "userProfile.0.bloodgroup": bloodgroup,
          "userProfile.0.dob": dob,
          "Driving.licenseNo": licenseNo,
          "Driving.licenseImage": licenseImage,
          "Driving.liceseExpire": liceseExpire

        },
      },
      (error, data) => {

        if (error) {
          res.status(200).send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 400, "message": data })
        }
        else {

          res.status(200).send({ "status": "success", "message": "profile Update  Successfully", "status": 201 })
        }

      }
    );


  }



  // for userAccount

  static userAccount = async (req, res) => {
    console.log(req.user._id)

    const account = await UserAccount.findOne({ user_id: req.user.id })

    const { role, timeZone } = req.body

    if (!account) {
      try {
        salutation
        const doc = new UserAccount({
          role: role,
          timeZone: timeZone,
          user_id: req.user.id
        })
        await doc.save()
        res.status(201).send({ "status": "success", "message": "account update  Successfully", "status": 201 })
      } catch (error) {

        res.status(500).send(error.message);
      }

    }

    else {

      UserAccount.updateOne({ user_id: req.user.id }, { $set: req.body }, (error, data) => {

        if (error) {
          res.status(403).send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 403 })
        }
        else {

          res.status(201).send({ "status": "success", "message": "Account update  Successfully", "status": 201 })
        }

      })


    }
  }






  // for Employment

  static employment = async (req, res) => {
    console.log(req.user._id)

    const emp = await Employment.findOne({ user_id: req.user.id })


    const { userDefinedCode, joiningDate, department, empGrade, finalAuthority, hod, linemanager, attendance, location, branch, designation, lineManager, finAuthority, probationPeriod
      , employee, employmed } = req.body


    if (!emp) {
      try {

        const doc = new Employment({
          userDefinedCode: userDefinedCode,
          joiningDate: joiningDate,
          department: department,
          empGrade: empGrade,
          finalAuthority: finalAuthority,
          hod: hod,
          linemanager: linemanager,
          attendance: attendance,
          location: location,
          branch: branch,
          designation: designation,
          lineManager: lineManager,
          finAuthority: finAuthority,
          probationPeriod: probationPeriod,
          employee: employee,
          employmed: employmed,

          user_id: req.user.id
        })
        console.log("kkkkkkkkkkkk", doc)
        await doc.save()
        res.send({ "status": "success", "message": "Employment created  Successfully", "status": 201 })
      } catch (error) {

        res.status(500).send(error.message);
      }

    }

    else {

      Employment.updateOne({ user_id: req.user.id }, { $set: req.body }, (error, data) => {

        if (error) {
          res.send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 403 })
        }
        else {

          res.send({ "status": "success", "message": "Employment update  Successfully", "status": 201 })
        }

      })


    }
  }




  // for QualificationExperience

  static qualificationExperience = async (req, res) => {
    console.log(req.user._id)

    const qualifi = await Qualification.findOne({ user_id: req.user.id })
    console.log(qualifi)
    console.log("uuuu", req.body.experience)


    const { companyName, experience, experiencCertification, schoolName, resultDeclar, cgp, resultCard, Name, certificateImage } = req.body

    if (!qualifi) {
      try {
        console.log("okey fine", req.body.experience)

        var exp = [];
        req.body.experience.forEach(function (eachObj) {
          var obj = {
            "companyName": eachObj.companyName,
            "startDate": eachObj.startDate,
            "endDate": eachObj.endDate,
            "experiencCertification": eachObj.experiencCertification
          }
          exp.push(obj);
        })
        console.log(exp)

        var qul = [];
        req.body.qualification.forEach(function (eachObj) {
          var obj = {
            "schoolName": eachObj?.schoolName,
            "resultDeclar": eachObj?.resultDeclar,
            "cgp": eachObj?.cgp,
            "resultCard": eachObj?.resultCard

          }
          qul.push(obj);
        })

        console.log("kkkkkkkkk", qul)

        var certificate = [];
        req.body.certification.forEach(function (eachObj) {
          var obj = {
            "Name": eachObj?.schoolName,
            "certificateImage": eachObj?.certificateImage,
          }
          certificate.push(obj);
        })
        console.log("opsosos", certificate)
        const doc = new Qualification({
          experience: exp,
          certification: certificate,
          qualification: qul,
          user_id: req.user.id
        })
        console.log(doc)
        await doc.save()
        res.send({ "status": "success", "message": "Employment created  Successfully", "status": 201 })
      } catch (error) {

        res.status(500).send(error.message);
      }

    }

    else {
      console.log(req.body)

      Qualification.updateOne({ user_id: req.user.id }, { $set: req.body }, (error, data) => {

        if (error) {
          res.send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 403 })
        }
        else {

          res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201 })
        }

      })


    }
  }




  // get record  allrequests

  static qualificationget = async (req, res) => {
    var draw = req.user._id;

    console.log(typeof (draw))
    const result = await UserModel.find({ _id: draw })
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }


  // allrequests for admin ,manager or hr

  static allrequest = async (req, res) => {
    var draw = req.user._id;

    console.log(typeof (draw))
    const tttt = await leaveRequest.find({ report_to_id: draw })
    console.log(tttt)

    const result = await leaveRequest.find({ report_to_id: draw, status: "pending" }).populate('user_id').sort({ createdAt: -1 })

    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }


  // get list of manager

  static getAllManager = async (req, res) => {
    var draw = req.user._id;

    console.log(typeof (draw))
    const result = await UserModel.find({ role: 'manager' })
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }



  // get record 

  static employmentget = async (req, res) => {
    var draw = req.user._id;

    console.log(typeof (draw))
    const result = await Employment.find({ user_id: draw })
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }



  static userLeaveDetail = async (req, res) => {
    var draw = req.user._id;

    console.log(typeof (draw))
    const result = await UserleaveType.find({ user_id: draw })
    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result })

  }


  //get all employee Type
  static emptype = async (req, res) => {


    console.log(typeof (draw))
    const result = await employType.find({})
    res.send({ "status": "success", "message": "All emyType ", "status": 201, "data": result })

  }


  // get leave details emptype

  static userInformation = async (req, res) => {
    var draw = req.user._id;

    console.log(typeof (draw))
    const result = await UserModel.find({ _id: draw })
    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result })

  }


  //approved leave  reject

  static approved = async (req, res) => {
    const cod = req.query.draw
    const result = await leaveRequest.findById({ _id: cod })
    console.log("result is ===>", result);
    const userdate = await UserleaveType.findOne({ user_id: result.user_id });
    console.log("userdate");


    //leaveRequest
    await UserleaveType.updateOne(
      { user_id: result.user_id },
      {
        $set: {
          "balance": userdate.balance,
          "leavetype": userdate.leaveType,
          "availed": userdate.availed + result.count,
          "available": userdate.available,
          "pending": userdate.pending - result.count,
        },
      },

    );

    await leaveRequest.updateOne(
      { _id: cod },
      {
        $set: {
          "status": 'complete',
        },
      },

    );
    res.send({ "status": "success", "message": " leave request is Approved successfullay", "status": 201 })


  }






  // leave  reject

  static reject = async (req, res) => {
    const cod = req.query.draw
    const result = await leaveRequest.findById({ _id: cod })
    console.log("result is ===>", result);
    const userdate = await UserleaveType.findOne({ user_id: result.user_id });
    console.log("userdate");


    //leaveRequest
    await UserleaveType.updateOne(
      { user_id: result.user_id },
      {
        $set: {
          "balance": userdate.balance,
          "leavetype": userdate.leaveType,
          "availed": userdate.availed,
          "available": userdate.available + result.count,
          "pending": userdate.pending - result.count,
        },
      },

    );

    await leaveRequest.updateOne(
      { _id: cod },
      {
        $set: {
          "status": 'reject',
        },
      },

    );
    res.send({ "status": "success", "message": " leave request is Approved successfullay", "status": 201 })


  }



  //leave Request

  static leaveRequest = async (req, res) => {
    console.log(req.user._id)
    //let data = await BookModel.findOne().populate("loaned_to");

    const userData = await user_report.findOne({ new_user_id: req.user._id })
    const report_to_id = userData.report_to_id
    console.log("hhhhhhhhhhhhhh" + userData.report_to_id)

    const { leaveType, short, shortLeaveType, startDate, endDate, count, totalCount, attachment, reason } = req.body
    try {

      const data = await UserleaveType.find({ user_id: req.user._id })

      if (data[0].available > 0) {
        console.log("heoo it is working")
        const doc = new leaveRequest({
          leaveType: leaveType,
          short: short,
          shortLeaveType: shortLeaveType,
          startDate: startDate,
          endDate: endDate,
          count: count,
          totalCount: totalCount,
          attachment: attachment,
          reason: reason,
          status: 'pending',
          report_to_id: report_to_id,
          user_id: req.user.id
        })
        console.log(doc)

        await doc.save()

        const result = await UserleaveType.find({ user_id: req.user._id })
        // console.log(result[0].balance - count)


        await UserleaveType.updateOne(
          { user_id: req.user._id },
          {
            $set: {
              "balance": result[0].balance,
              "leavetype": leaveType,
              "availed": result[0].availed,
              "available": result[0].available - count,
              "pending": result[0].pending + count,
            },
          },

        );


      } else {
        return res.send({ "status": "success", "message": "leaveRequest created  Successfully", "status": 401 })
      }


      res.send({ "status": "success", "message": "leaveRequest created  Successfully", "status": 201 })
    } catch (error) {

      res.status(500).send(error.message);
    }
  }



  // get leaveRequests 

  static userLeaveRequest = async (req, res) => {
    var draw = req.user._id;
    // console.log()


    console.log(typeof (draw))
    // const result = await leaveRequest.find({ user_id: draw }).populate('user_id').populate('Employment')
    const result = await UserModel.find({ _id: draw }).populate('Employment').populate('leaveRequest').populate("user_report")

    console.log(result)
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }

  //assigned by 
  static assigned = async (req, res) => {

    const userData = await UserModel.findOne({ _id: req.user._id })
    console.log(userData.role)
    const admin = userData.role

    if (admin === 'admin') {

      console.log(req.user._id)

      user_report.updateOne(
        { new_user_id: req.body.new_user_id },
        {
          $set: {
            "report_to_id": req.body.report_to_id,
            "assign_by_id": req.user._id,
            "assign_Date": req.body.assign_Date,
          },
        },
        (error, data) => {

          if (error) {
            res.status(200).send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 400, "message": data })
          }
          else {

            res.status(200).send({ "status": "success", "message": "user Assigned  Successfully", "status": 201 })
          }

        }
      );
    } else {

      res.send({ "status": "failed", "message": "only Admin can change" })

    }


  }





  //for add employment Type  
  static empType = async (req, res) => {
    console.log(req.body)
    const userData = await UserModel.findOne({ _id: req.user._id })
    console.log(userData.role)
    const admin = userData.role
    const { empType, totalleave, probationLeave, weddingLeave, bereavementLeave, casualleave, sickLeave } = req.body

    if (admin === 'admin') {
      try {

        const doc = new employType({
          totalleave: totalleave,
          weddingLeave: weddingLeave,
          empType: empType,
          casualleave: casualleave,
          bereavementLeave: bereavementLeave,
          sickLeave: sickLeave,
          probationLeave: probationLeave,

        })
        console.log("doc===", doc)
        await doc.save()

        res.status(201).send({ "status": "success", "message": "Registration Success", "status": 201 })
      } catch (error) {

        res.status(500).send(error.message);
      }


    } else {

      res.send({ "status": "failed", "message": "only Admin can add " })

    }


  }




}










module.exports = UserController
// export default UserController