var UserModel = require('../model/users')
var UserAccount = require('../model/userAccount')
var Employment = require('../model/employment')
// const leaveType =require('../model/leaveType')
var Qualification = require("../model/qualificationExperience")
var leaveRequest = require("../model/leaveRequest")
var UserleaveType = require('../model/leaveType')
var user_report = require("../model/user_report")
var employType = require("../model/employType")
var Friends = require("../model/friends")
var path = require("path");
var multer = require('multer');
var sharp = require('sharp')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var config = require('../config/config')
var Notification = require('../model/notification')

const UserProfile = require('../model/userProfile')
const { stringify } = require('querystring')
const { json } = require('express')



class UserController {



  //for userRegistration 
  static userRegistration = async (req, res) => {
    const totalLeave = await employType.findOne({ _id: req.body.emplType })
    var total = totalLeave.totalleave
    const userData = await UserModel.findOne({ _id: req.user._id })
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
              await doc.save()
              const saved_user = await UserModel.findOne({ email: email })
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
              await lev.save()
              // Generate JWT Token
              // const token = jwt.sign({ userID: saved_user._id }, config.secret, { expiresIn: '5d' })
              res.status(201).send({ "status": "success", "message": "Registration Success", "status": 201 })
            } catch (error) {
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
      if (email && password) {
        const user = await UserModel.findOne({ email: email })
        if (user != null) {
          const isMatch = await bcrypt.compare(req.body.password, user.password);
          if ((user.email === email) && isMatch) {
            // Generate JWT Token 86400
            const token = jwt.sign({ userID: user._id, username: user.username }, config.secret, { expiresIn: 10 })
            const refreshToken = jwt.sign({ userID: user._id, username: user.username }, config.secret, { expiresIn: '5y' })

            res.status(201).send({ "status": "success", "message": "Login Success", "token": token, "refreshToken": refreshToken, "status": 201 })
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
      res.status(401).send({ "status": "failed", "message": "Unable to Login", "status": 401 })
    }
  }

  //refresh token 
  static refreshToken = async (req, res) => {
    try {
      const { token } = req.body
      if (token) {
        const decode = await jwt.verify(token, 'supersecret', (err, decode) => {
          if (err) reject(err)
          var tokenRefresh = jwt.sign({ userID: decode.userID, username: decode.username }, config.secret, { expiresIn: 10 })
          res.status(201).send({ "status": "success", "message": "Login Success", "token": tokenRefresh, "status": 201 })

        })
      }
      else {
        res.status(403).send('token Unavailable!!')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  }

  // for changeUserPassword

  static changeUserPassword = async (req, res) => {

    const user = await UserModel.findOne({ _id: req.user._id })
    if (user != null) {
      const isMatch = await bcrypt.compare(req.body.current_password, user.password);

      if (isMatch) {
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

  //   const profile = await UserProfile.findOne({ user_id: req.user.id })
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
    console.log("jdddddddddddddddd>>>>>>>>>>>.",req.body)

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

    try {
      const result = {
        pathArray

      }
      res.status(200).send(result)
    } catch (e) {
      res.status(500).send(e.message)
    }
  }



  // for changeUserProfile  

  static quickcontact = async (req, res) => {

    const { img, salutation, fatherName, gender, maritalStatus, religion, nationality, bloodgroup, dob } = req.body
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
    const pathArray = ['image', 'image', 'image2'];
    var religionImage = 'image';
    const { mobile, quickEmail, lineNumber, CNIC, passportNo, salutation, fatherName, gender, maritalStatus, religion, nationality, bloodgroup, dob
      , CNICImage, CNICExpire, passportImage, passportExpire, licenseImage, licenseNo, liceseExpire, attachment } = req.body

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
          "userProfile.0.img.profile_pic.100": attachment?.[0],
          "userProfile.0.img.profile_pic.250": attachment?.[1],
          "userProfile.0.img.profile_pic.550": attachment?.[2],
          "userProfile.0.img.profile_pic.original": attachment?.[3],
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

    const qualifi = await Qualification.findOne({ user_id: req.user.id })
    const { companyName, experience, experiencCertification, schoolName, resultDeclar, cgp, resultCard, Name, certificateImage } = req.body

    if (!qualifi) {
      try {
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
        var certificate = [];
        req.body.certification.forEach(function (eachObj) {
          var obj = {
            "Name": eachObj?.schoolName,
            "certificateImage": eachObj?.certificateImage,
          }
          certificate.push(obj);
        })
        const doc = new Qualification({
          experience: exp,
          certification: certificate,
          qualification: qul,
          user_id: req.user.id
        })
        await doc.save()
        res.send({ "status": "success", "message": "Employment created  Successfully", "status": 201 })
      } catch (error) {

        res.status(500).send(error.message);
      }

    }

    else {

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
    const result = await UserModel.find({ _id: draw })
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }

  // get record  allrequests emptype_id

  static getUserInfo = async (req, res) => {
    var draw = req.query.id;
    const result = await UserModel.find({ _id: draw }).populate('emptype_id')
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }


  // allrequests for admin ,manager or hr

  // static allrequest = async (req, res) => {
  //   var draw = req.user._id;
  //   const tttt = await leaveRequest.find({ report_to_id: draw })
  //   const result = await leaveRequest.find({ report_to_id: draw, status: "pending" }).populate('user_id').sort({ createdAt: -1 })

  //   res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  // }




  //getAllUsers

  static allrequest = async (req, res, next) => {
    const result = {};
    var draw = req.user._id;
    const totalUsers = await leaveRequest.find({ report_to_id: draw, status: "pending" }).countDocuments().exec();
    result.totalUsers = totalUsers;

    var start = parseInt(req.query.start);
    const limit = parseInt(req.query.length);

    result.data = await leaveRequest.find(
      { report_to_id: draw, status: "pending" }

    ).populate('user_id').skip(start)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .exec();
    // count search data  for pagination 
    result.data2 = await leaveRequest.find(
      { report_to_id: draw, status: "pending" }
    )

    let totalSearchPost = result.data2
    res.status(200).send({ data: result.data, totalUsers: totalSearchPost.length })

  }

  // get list of manager

  static getAllManager = async (req, res) => {
    var draw = req.user._id;
    const result = await UserModel.find({ role: 'manager' })
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }

  // get record 

  static employmentget = async (req, res) => {
    var draw = req.user._id;
    const result = await Employment.find({ user_id: draw })
    res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  }

  static userLeaveDetail = async (req, res) => {
    var draw = req.user._id;
    const result = await UserleaveType.find({ user_id: draw })
    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result })

  }


  // static userLeaveDetail = async (req, res, next) => {
  //   const result = {};
  //   var draw = req.user._id;
  //   const totalUsers = await UserleaveType.find({ user_id: draw }).countDocuments().exec();
  //   result.totalUsers = totalUsers;
  //   return
  //   var start = parseInt(req.query.start);
  //   const limit = parseInt(req.query.length);

  //   result.data = await leaveRequest.find(
  //     { report_to_id: draw, status: "pending" }

  //   ).populate('user_id').skip(start)
  //     .limit(limit)
  //     .sort({ updatedAt: -1 })
  //     .exec();
  //   // count search data  for pagination 
  //   result.data2 = await leaveRequest.find(
  //     { report_to_id: draw, status: "pending" }
  //   )

  //   let totalSearchPost = result.data2
  //   res.status(200).send({ data: result.data, totalUsers: totalSearchPost.length })

  // }




  //get all employee Type
  static emptype = async (req, res) => {
    const result = await employType.find({})
    res.send({ "status": "success", "message": "All emyType ", "status": 201, "data": result })

  }


  //get all Report to member Type
  static getReportToMember = async (req, res) => {
    const result = await UserModel.find({ $or: [{ role: "hr" }, { role: "manager" }, { role: "admin" }] })
    res.send({ "status": "success", "message": "All report To Member ", "status": 201, "data": result })

  }

  // userlist
  static userlist = async (req, res) => {
    var draw = req.user._id;
    const page = parseInt(req.query.page);
    const skip = parseInt(req.query.skip);

    const limit = page * 4
    if (page > 1) {
      var skips = skip * (page - 1)
    }
    const result = await UserModel.find({ _id: { $ne: { _id: draw } } }).skip(skips).limit(5).sort({ updatedAt: -1 })
    // const result = await UserModel.find({ $nor:[{_id:draw}]}).sort({ updatedAt: -1 }).populate("friends")

    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result, "userID": draw })

  }
  // get leave details emptype 

  static userInformation = async (req, res) => {
    var draw = req.user._id;
    const result = await UserModel.find({ _id: draw })
    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result })

  }

  //notification
  static notification = async (req, res) => {
    var draw = req.user._id;
    const page = parseInt(req.query.page);
    const skip = parseInt(req.query.skip);

    const limit = page * 4
    if (page > 1) {
      var skips = skip * (page - 1)
    }
    const result = await Notification.find({ $and: [{ reciever_id: draw }, { isread: false }] }).skip(skips).limit(4).populate('sender_id').sort({ updatedAt: -1 })
      .exec();
    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result })


  }
  // clear notification clearNotification

  static clearNotification = async (req, res) => {
    var draw = req.user._id;
    await Notification.updateMany(
      { reciever_id: draw },
      { $set: { isread: true } }
    )
    res.send({ "status": "success", "message": "clear all notification  ", "status": 201, })



  }


  static notificationTotal = async (req, res) => {
    var draw = req.user._id;
    const resultTotal = await Notification.find({ $and: [{ reciever_id: draw }, { isread: false }] }).count()
    const result = await Notification.find({ $and: [{ reciever_id: draw }, { isread: false }] }).limit(4).populate('sender_id')
    res.send({ "status": "success", "message": "leave details ", "status": 201, "data": result, "totalNotification": resultTotal })


  }


  //approved leave  reject

  static approved = async (req, res) => {
    const cod = req.query.draw
    const result = await leaveRequest.findById({ _id: cod })
    const userdate = await UserleaveType.findOne({ user_id: result.user_id });
    //leaveRequest addfriend
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

    res.send({ "status": "success", "message": " leave request is Approved successfullay", "status": 201, "userID": result.user_id })

  }


  static acceptrequect = async (req, res) => {
    const requester = req.query.draw
    const recipient = req.user._id
    const tes = await Friends.updateOne(
      { $and: [{ requester: requester }, { recipient: recipient }] },
      { $set: { "status": 3 } }

    )
    // await Friends.updateOne(
    //   { $and: [{ recipient: requester }, { requester: recipient }] },
    //   { $set: { "status": 3 } }

    // )
    return res.send({ "status": "success", "message": "  friend  successfully ", "status": tes, })

  }

  //rejectrequect

  static rejectrequect = async (req, res) => {
    const requester = req.query.draw
    const recipient = req.user._id
    await Friends.updateOne(
      { $and: [{ requester: requester }, { recipient: recipient }] },
      { $set: { "status": 0 } }

    )
    return res.send({ "status": "success", "message": "  Friend Request Rejected   successfully ", "status": 201, })

  }

  //for friend request friendRequests acceptrequect

  static addfriend = async (req, res) => {
    //replace each other 
    const recipient = req.query.draw
    const requester = req.user._id
    if (!requester) {
      return
    }
    const docA = await Friends.findOne({ requester: requester, recipient: recipient, status: 2 })
    if (docA) {
      return "already request sent"
    }

    await Friends.findOneAndUpdate(
      { requester: requester, recipient: recipient },
      { $set: { status: 2 } },
      { upsert: true, new: true }
    )


    // const docA = await Friends.findOneAndUpdate(
    //   { requester: requester, recipient: recipient },
    //   { $set: { status: 2 } },
    //   { upsert: true, new: true }
    // )
    // const docB = await Friends.findOneAndUpdate(
    //   { recipient: requester, requester: recipient },
    //   { $set: { status: 1 } },
    //   { upsert: true, new: true }
    // )
    // const updaterequester = await UserModel.findOneAndUpdate(
    //   { _id: requester },
    //   { $push: { friends: docA._id } }
    // )
    // const updaterecipient = await UserModel.findOneAndUpdate(
    //   { _id: recipient },
    //   { $push: { friends: docB._id } }
    // )
    return res.send({ "status": "success", "message": " your friend request successfully ", "status": 201, })

  }

  // friendRequests

  static friendRequests = async (req, res) => {
    const id = req.user._id
    const result = await Friends.find({ recipient: id }).populate('requester')
    // const result = await Friends.find({ $or: [{ requester:id}, { recipient: id }] }).populate('recipient')
    return res.send({ "status": "success", "message": " Get all firend requests successfullay", "status": 201, "result": result })

  }

  //all friend request 
  static allfriends = async (req, res) => {
    const id = req.user._id
    const page = parseInt(req.query.page);
    const skip = parseInt(req.query.skip);

    const limit = page * 4
    if (page > 1) {
      var skips = skip * (page - 1)
    }
    const result = await Friends.find({ $or: [{ requester: id }, { recipient: id }], $and: [{ status: 3 }] }).skip(skips).limit(5).populate('recipient').populate("requester")

    return res.send({ "status": "success", "message": " Get all firend requests successfullay", "status": 201, "result": result })


  }





  // leave  reject

  static reject = async (req, res) => {
    const cod = req.query.draw
    const result = await leaveRequest.findById({ _id: cod })
    const userdate = await UserleaveType.findOne({ user_id: result.user_id });
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
    res.send({ "status": "success", "message": " leave request is reject successfullay", "status": 201, "userID": result.user_id })


  }



  //leave Request

  static leaveRequest = async (req, res) => {
    //let data = await BookModel.findOne().populate("loaned_to");

    const userData = await user_report.findOne({ new_user_id: req.user._id })
    const report_to_id = userData.report_to_id
    const { leaveType, short, shortLeaveType, startDate, endDate, count, totalCount, attachment, reason } = req.body
    try {

      const data = await UserleaveType.find({ user_id: req.user._id })

      if (data[0].available > 0 && count <= data[0].available) {
        // && short == false
        if (short == false) {
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
          await doc.save()
        } else if (short == true && count < 2) {

          const doc = new leaveRequest({
            leaveType: leaveType,
            short: short,
            shortLeaveType: shortLeaveType,
            startDate: startDate,
            endDate: endDate,
            count: 0.5,
            totalCount: 0.5,
            attachment: attachment,
            reason: reason,
            status: 'pending',
            report_to_id: report_to_id,
            user_id: req.user.id
          })
          await doc.save()

        } else {
          return res.send({ "status": "success", "message": "leaveRequest created  Successfully", "status": 402, "report_to_id": report_to_id, 'user_id': req.user.id })

        }

        const result = await UserleaveType.find({ user_id: req.user._id })
        if (short == false) {
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
          await UserleaveType.updateOne(
            { user_id: req.user._id },
            {
              $set: {
                "balance": result[0].balance,
                "leavetype": leaveType,
                "availed": result[0].availed,
                "available": result[0].available - 0.5,
                "pending": result[0].pending + 0.5,
              },
            },

          );

        }



      } else {
        return res.send({ "status": "success", "message": "leaveRequest created  Successfully", "status": 401, "report_to_id": report_to_id, 'user_id': req.user.id })
      }


      res.send({ "status": "success", "message": "leaveRequest created  Successfully", "status": 201, "report_to_id": report_to_id, 'user_id': req.user.id })
    } catch (error) {

      res.status(500).send(error.message);
    }
  }



  // // get leaveRequests 

  // static userLeaveRequest = async (req, res) => {
  //   var draw = req.user._id;
  //   // const result = await leaveRequest.find({ user_id: draw }).populate('user_id').populate('Employment')
  //   // const result = await UserModel.find({ _id: draw }).populate('Employment').populate('leaveRequest').populate("user_report")
  //   await UserModel.find({ _id: draw }).populate({
  //     path: 'leaveRequest',
  //     options: {
  //       limit: 1,
  //       sort: { createdAt: -1 },
  //     }
  //   }).populate('Employment').populate("user_report").exec(function (err, result) {
  //     if (err) return handleError(res, err);
  //     res.send({ "status": "success", "message": "Qualification update  Successfully", "status": 201, "data": result })

  //   });


  // }


  static userLeaveRequest = async (req, res, next) => {
    const result = {};
    var draw = req.user._id;
    var start = parseInt(req.query.start);
    const limit = parseInt(req.query.length);
    // totalUsers: totalSearchPost.length 
    const totalRequest = await leaveRequest.find({ user_id: draw })
    result.data = await UserModel.find({ _id: draw }).populate({
      path: 'leaveRequest',
      options: {
        skip: start,
        limit: limit,
        sort: { createdAt: -1 },
      }
    }).populate('Employment').populate("user_report").exec();


    res.status(200).send({ data: result.data, totalUsers: totalRequest.length })

  }

  //assigned by 
  static assigned = async (req, res) => {

    const userData = await UserModel.findOne({ _id: req.user._id })
    const admin = userData.role

    if (admin === 'admin') {
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





  //for add employment Type   GetProductData
  static empType = async (req, res) => {
    const userData = await UserModel.findOne({ _id: req.user._id })
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
        await doc.save()

        res.status(201).send({ "status": "success", "message": "Registration Success", "status": 201 })
      } catch (error) {

        res.status(500).send(error.message);
      }


    } else {

      res.send({ "status": "failed", "message": "only Admin can add " })

    }


  }


  static GetUsersData = async (req, res, next) => {

    try {


      var start = parseInt(req.query.start);
      const limit = parseInt(req.query.length);
      const result = {};
      var search_value = req.query.search;
      const totalUsers = await UserModel.countDocuments().exec();
      result.totalUsers = totalUsers;
      result.rowsPerPage = limit;
      if (search_value == 'undefined') {
        //if search Value in empty
      } else {

        result.data = await UserModel.find(
          {
            $or: [{ username: { $regex: search_value, "$options": "i" } },


            ]

          }

        ).populate('Employment').skip(start)
          .limit(limit)
          .sort({ updatedAt: -1 })
          .exec();
        result.rowsPerPage = limit;



      }

      // count search data  for pagination 
      result.data2 = await UserModel.find(
        {
          $or: [{ username: { $regex: search_value, "$options": "i" } },

          ]
        }

      )


      let totalSearchPost = result.data2

      // if search value are found
      if (search_value) {
        res.status(200).send({ data: result.data, totalUsers: totalUsers, recordsFiltered: totalSearchPost.length })
      }
      else {
        res.status(200).send({ data: result.data, totalUsers: totalUsers, recordsFiltered: totalUsers })

      }

    } catch (e) {
      res.status(500).send(e.message)
    }


  }



  //getAllUsers

  static getAllUsers = async (req, res, next) => {
    const result = {};
    const totalUsers = await UserModel.countDocuments().exec();
    result.totalUsers = totalUsers;

    var start = parseInt(req.query.start);
    const limit = parseInt(req.query.length);
    var search_value = req.query.search;
    result.data = await UserModel.find(
      {
        $or: [{ username: { $regex: search_value, "$options": "i" } },


        ]

      }

    ).populate('Employment').skip(start)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .exec();

    // count search data  for pagination 
    result.data2 = await UserModel.find(
      {
        $or: [{ username: { $regex: search_value, "$options": "i" } },
        ]
      }
    )

    let totalSearchPost = result.data2
    res.status(200).send({ data: result.data, totalUsers: totalSearchPost.length })

  }

  //get all Report to member Type
  static getReportTo = async (req, res) => {
    var id = req.query.id;

    const data = await user_report.findOne({ new_user_id: id })
    const reportToId = data?.report_to_id
    if (reportToId) {
      const result = await UserModel.findOne({ _id: reportToId })
      res.send({ "status": "success", "message": "All report To Member ", "status": 201, "data": result })
    }

  }

  // admin change user profile info 

  static Updateuserprofile = async (req, res) => {
    // return
    const totalLeave = await employType.findOne({ _id: req.body.emplType })
    var total = totalLeave.totalleave
    var leavetype = totalLeave.empType
    const { username, fname, lastname, title, company, email, role, emplType, user_id, reportToId } = req.body


    UserModel.updateOne(
      { _id: user_id },
      {
        $set: {
          "username": username,
          "fname": fname,
          "lastname": lastname,
          "title": title,
          "company": company,
          "email": email,
          "role": role,
          "emptype_id": emplType,
          "empleave": total
        },
      },

      (error, data) => {

        if (error) {
          res.status(200).send({ "status": "failed", "message": "some thing went wrong ,data can not be update", "status": 400, "message": data })
        }
        else {
          UserleaveType.updateOne(
            { user_id: user_id },
            {
              $set: {
                "balance": total,
                "available": total,
                "availed": 0,
                "pending": 0,
                "leavetype": leavetype,

              },
            },

          ).lean().exec();

          user_report.updateOne(
            { user_id: user_id },
            {
              $set: {
                "new_user_id": user_id,
                "report_to_id": reportToId,
                "assign_by_id": req.user._id,


              },
            },

          ).lean().exec();





          leaveRequest.findOneAndDelete({ user_id: user_id }, (err, result) => {

          })

          res.status(200).send({ "status": "success", "message": "profile Update  Successfully", "status": 201 })
        }

      }
    );


  }

}










module.exports = UserController
// export default UserController