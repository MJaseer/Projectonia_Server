import express from 'express'

import { checkForgotToken, forgotPasswordSend, getManager, getVerified, login, profileImage, register, setToken, storeUser, updateManager,  } from '../Controllers/managerController.js'
import { addAssignee, deleteAssignee, editAssignee, getAssignee } from '../Controllers/assigneeController.js'
import { verifyUser } from '../Middlewares/verification.js'
import uploadImage from '../Middlewares/multer.js'

const router = express.Router()

router.post('/register',register)

router.post('/otpPost', storeUser)

router.post('/forgotPassword', forgotPasswordSend)

router.get('/reset', checkForgotToken)

router.post('/setPassword',setToken)

router.post('/login',login)

router.post('/addAssignee/:id',addAssignee)

router.get('/getAssignee/:id',verifyUser,getAssignee)

router.patch('/editAssignee/:id',verifyUser,editAssignee)

router.delete('/deleteAssignee/:id',verifyUser,deleteAssignee)

router.post('/getManager/:manager_id',verifyUser, getManager)

router.put('/updateManager/:manager_id',verifyUser,updateManager)

// router.post('/getVerified',getVerified)

router.post('/getImage',verifyUser,uploadImage,profileImage)

// router.get('/logout', async (req, res) => {
//     console.log('logout');
//     res.clearCookie('jwtToken');
//     res.status(200).json({
//         message: 'success'
//     })   
// })

export default router;