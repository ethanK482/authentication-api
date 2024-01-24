import { checkSchema } from "express-validator";
const RegisterMiddleware = checkSchema({
  firstName: {
    notEmpty: true,
    errorMessage: "First name is required"
  },
  lastName: {
    notEmpty: true,
    errorMessage: "Last name is required"
  },
  email: {
    isEmail: {errorMessage: "Please enter an email address"},
    notEmpty: {errorMessage: "Email is required"},
  },
  role: {
    custom: {
        options: (value) => ['admin', 'user'].includes(value),
        errorMessage: "Role must be either 'admin' or 'user'",
    },
},
  password:{
    isString: true,
    notEmpty: {errorMessage: "Password is required"},
    isLength:{
        options: {min:10},
        errorMessage: "Password must be at least 10 characters long"
    }
  },

  confirmPassword:{
    isString: true,
    notEmpty: {errorMessage: "Confirm password is required"},
  }
});


const LoginMiddleware = checkSchema({

  email: {
    isEmail: {errorMessage: "Please enter an email address"},
    notEmpty: {errorMessage: "Email is required"},
  },
  password:{
    isString: true,
    notEmpty: {errorMessage: "Password is required"},
    isLength:{
        options: {min:10},
        errorMessage: "Password must be at least 10 characters long"
    }
  },

});


const GetResetTokenMiddleWare = checkSchema({

  email: {
    isEmail: {errorMessage: "Please enter an email address"},
    notEmpty: {errorMessage: "Email is required"},
  },

});


const ResetPasswordMiddleware = checkSchema({
  email: {
    isEmail: {errorMessage: "Please enter an email address"},
    notEmpty: {errorMessage: "Email is required"},
  },
  newPassword:{
    isString: true,
    notEmpty: {errorMessage: "Password is required"},
    isLength:{
        options: {min:10},
        errorMessage: "Password must be at least 10 characters long"
    }
  },
  confirmNewPassword:{
    isString: true,
    notEmpty: {errorMessage: "Confirm password is required"},
  },
  resetToken:{
    isString: true,
    notEmpty:{errorMessage: "reset token is required"},
  }
});

const GetVerifyEmailTokenMiddleWare = checkSchema({
  verifyEmailToken: {
    notEmpty: {errorMessage: "Verify Email Token is required"},
  }

});

export {RegisterMiddleware, LoginMiddleware,  GetResetTokenMiddleWare, ResetPasswordMiddleware,GetVerifyEmailTokenMiddleWare  }
