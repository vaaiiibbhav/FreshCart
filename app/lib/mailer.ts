import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({to,subject,html}:{
  to:string,
  subject:string,
  html:string
}) => {
  try{
    await transporter.sendMail({
      from:`"Urban Grocer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
  }catch(err){
    console.log(err)
  }
}