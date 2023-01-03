// global.fetch = require("node-fetch");
// global.navigator = () => null;
import fetch from "node-fetch";
import AmazonCognitoIdentity from "amazon-cognito-identity-js";
import jwkToPem from "jwk-to-pem";
import jwt from "jsonwebtoken";
// const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const poolData = {
  UserPoolId: "eu-west-2_BbQoMpDS7",
  ClientId: "6mk031vm134kdbvu3ca9vhujg",
};
// const poolData = {
//   UserPoolId: "ap-south-1_H0AyV6k0O",
//   ClientId: "7plqmkvuom271mf3bu0llret19",
// };
const pool_region = "eu-west-2";
// const pool_region = "ap-south-1";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
export const Register = (body, callback) => {
  var name = body.name;
  var email = body.email;
  var password = body.password;
  var attributeList = [];

  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "email",
      Value: email,
    })
  );
  userPool.signUp(name, password, attributeList, null, function (err, result) {
    if (err) callback(err);
    var cognitoUser = result.user;
    callback(null, cognitoUser);
  });
};

export const Login = (body, callback) => {
  var userName = body.name;
  var password = body.password;
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: userName,
    Password: password,
  });
  var userData = {
    Username: userName,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      debugger;
      var accesstoken = result.getAccessToken().getJwtToken();
      callback(null, accesstoken);
    },
    onFailure: function (err) {
      debugger;
      callback(err);
    },
    mfaRequired: function (codeDeliveryDetails) {
      debugger;
      // MFA is required to complete user authentication.
      // Get the code from user and call
      //cognitoUser.sendMFACode(mfaCode, this);
    },
    newPasswordRequired: function (userAttributes, requiredAttributes) {
      debugger;
      // User was signed up by an admin and must provide new
      // password and required attributes, if any, to complete
      // authentication.

      if (!body.newPassword) {
        callback("New password required");
        return;
      }

      // the api doesn't accept this field back
      delete userAttributes.email_verified;
      delete userAttributes.email;

      // const newPassword = "Admin@12345";
      const newPassword = body.newPassword;
      // store userAttributes on global variable
      const sessionUserAttributes = userAttributes;
      debugger;
      cognitoUser.completeNewPasswordChallenge(
        newPassword,
        {},
        {
          onSuccess: (result) => {
            debugger;
            callback("NEW PASSWORD COMPLETED: ");
            console.log(result);
          },
          onFailure: (err) => {
            debugger;
            callback(err);
          },
        }
      );
    },
    mfaSetup: function (challengeName, challengeParameters) {
      debugger;
      cognitoUser.associateSoftwareToken(this);
    },
    associateSecretCode: function (secretCode) {
      debugger;
      var challengeAnswer = prompt("Please input the TOTP code.", "");
      cognitoUser.verifySoftwareToken(challengeAnswer, "My TOTP device", this);
    },
    selectMFAType: function (challengeName, challengeParameters) {
      debugger;
      var mfaType = prompt("Please select the MFA method.", ""); // valid values for mfaType is "SMS_MFA", "SOFTWARE_TOKEN_MFA"
      cognitoUser.sendMFASelectionAnswer(mfaType, this);
    },
    totpRequired: function (secretCode) {
      debugger;
      var challengeAnswer = prompt("Please input the TOTP code.", "");
      cognitoUser.sendMFACode(challengeAnswer, this, "SOFTWARE_TOKEN_MFA");
    },
  });
};

export const Validate = async (token, callback) => {
  try {
    const response = await fetch(
      `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`
    );
    const data = await response.json();

    console.log(data);
    // await fetch(
    //   {
    //     url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
    //     json: true,
    //   },
    // const checkToken =  (error, response, body)=> {

    const checkToken = (body) => {
      // if (!error && response.statusCode === 200) {
      // debugger;
      const pems = {};
      var keys = body["keys"];
      for (var i = 0; i < keys.length; i++) {
        var key_id = keys[i].kid;
        var modulus = keys[i].n;
        var exponent = keys[i].e;
        var key_type = keys[i].kty;
        var jwk = { kty: key_type, n: modulus, e: exponent };
        var pem = jwkToPem(jwk);
        pems[key_id] = pem;
      }
      var decodedJwt = jwt.decode(token, { complete: true });
      if (!decodedJwt) {
        console.log("Not a valid JWT token");
        callback(new Error("Not a valid JWT token"));
      }
      var kid = decodedJwt.header.kid;
      var pem = pems[kid];
      if (!pem) {
        console.log("Invalid token");
        callback(new Error("Invalid token"));
      }
      jwt.verify(token, pem, function (err, payload) {
        if (err) {
          console.log("Invalid Token.");
          callback(new Error("Invalid token"));
        } else {
          console.log("Valid Token.");
          callback(null, "Valid token");
        }
      });
      // }

      // else {
      //   debugger;
      //   console.log("Error! Unable to download JWKs");
      //   callback(error);
      // }
    };

    const status = checkToken(data);
    return status;
    // );
  } catch (e) {
    console.log(e);
  }
};

export const changePassword = (body, callback) => {
  var oldPassword = body.oldPassword;
  var newPassword = body.newPassword;
};

export const verify = (body, callback) => {
  var userName = body.name;
  var userData = {
    Username: userName,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const authDetails = new AuthenticationDetails({
    Username: userName,
    Password: body.password,
  });
  cognitoUser.authenticateUser(authDetails, {
    onSuccess: function (result) {
      debugger;
      console.log("call result: " + result);
    },
    onFailure: function (err) {
      debugger;
      alert(err.message || JSON.stringify(err));
    },
    inputVerificationCode: function () {
      debugger;
      var verificationCode = prompt("Please input verification code: ", "");
      cognitoUser.verifyAttribute("email", verificationCode, this);
    },
  });
};

export const enableMFA = (body, callback) => {
  var userName = body.name;
  var password = body.password;
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: userName,
    Password: password,
  });
  var userName = body.name;
  var userData = {
    Username: userName,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  var totpMfaSettings = {
    PreferredMfa: true,
    Enabled: true,
  };

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      debugger;
      console.log("User authenticated");
      // cognitoUser.setUserMfaPreference(
      //   null,
      //   totpMfaSettings,
      //   function (err, result) {
      //     debugger;
      //     if (err) {
      //       callback(JSON.stringify(err));
      //       // alert(err.message || JSON.stringify(err));
      //     }
      //     callback(null, result);
      //   }
      // );
      var accesstoken = result.getAccessToken().getJwtToken();
      try {
        const result = cognitoUser.associateSoftwareToken({
          onFailure: (error) => {
            debugger;
            console.error(error);
          },
          associateSecretCode: (code) => {
            debugger;
            console.debug(code);
            cognitoUser.verifySoftwareToken("429663", "My TOTP device", {
              onFailure: (error) => {
                debugger;
              },
              onSuccess: (result) => {
                debugger;
              },
            });
          },
        });
      } catch (err) {
        debugger;
      }
    },
    onFailure: (error) => {
      debugger;
      console.log("An error happened");
    },
  });

  // Login({ name: body.name, password: body.password }, function () {

  // });
};
