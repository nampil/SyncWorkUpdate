const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')
const { getAuth } = require('firebase-admin/auth')
const db = admin.firestore()

exports.updateUser = functions.https.onCall(async (data, context) => {
  const authAdminLevel = parseInt(context.auth.token.adminLevel)

  // eslint-disable-next-line
  console.log('data', data)

  const {
    uid,
    email,
    authLevel,
    displayName,
    name,
    lastName,
    rol,
    userDocuments,
    appAccess,
    webAccess,
    avatar,
    nickname,
    companyName,
    phoneNumber,
    comments,
    address,
    disabled,
    archived,
    departments,
  } = data

  if (
    authAdminLevel < 9 ||
    (!!authLevel && parseInt(authLevel) > authAdminLevel) ||
    !uid
  ) {
    return {
      error: 'No Authorized',
    }
  }

  try {
    const userRecord = await getAuth().getUser(uid)

    const userClaimsFromData = {
      authLevel,
      rol,
      appAccess,
      webAccess,
    }

    const hasToUpdateClaims = Object.keys(userClaimsFromData).some((claim) => {
      return userClaimsFromData[claim] !== userRecord[claim]
    })

    if (hasToUpdateClaims) {
      // eslint-disable-next-line
      console.log('Has to update Claims')

      const updatedCustomClaims = {
        ...userRecord.customClaims,
        ...(typeof authLevel !== 'undefined' && { authLevel }),
        ...(typeof rol !== 'undefined' && { rol }),
        ...(typeof appAccess !== 'undefined' && { appAccess }),
        ...(typeof webAccess !== 'undefined' && { webAccess }),
      }

      await getAuth().setCustomUserClaims(userRecord.uid, updatedCustomClaims)
    }
    const userRecordFromData = {
      email,
      displayName,
      disabled,
    }

    const hasToUpdateUserRecord = Object.keys(userRecordFromData).some(
      (key) => {
        return userRecordFromData[key] !== userRecord[key]
      }
    )

    if (hasToUpdateUserRecord) {
      await getAuth().updateUser(uid, {
        ...(typeof email !== 'undefined' && { email }),
        ...(typeof displayName !== 'undefined' && { displayName }),
        ...(typeof disabled !== 'undefined' && { disabled }),
      })
      if (disabled) {
        await getAuth().revokeRefreshTokens(uid)
      }
    }

    const adminUserProfile = {
      companyName,
      comments,
      address,
      phoneNumber,
      userDocuments,
      departments,
    }

    const hastToUpdateAdminUserProfile = !Object.keys(adminUserProfile).every(
      (key) => {
        if (adminUserProfile[key] && Array.isArray(adminUserProfile[key])) {
          return adminUserProfile[key].length === 0
        }
        return (
          typeof adminUserProfile[key] === 'undefined' ||
          adminUserProfile[key] === null
        )
      }
    )

    if (hastToUpdateAdminUserProfile) {
      await db.doc(`users/${userRecord.uid}/admin/profile`).set(
        {
          ...(companyName && { companyName }),
          ...(comments && { comments }),
          ...(address && { address }),
          ...(phoneNumber && { phoneNumber }),
          ...(userDocuments && { userDocuments }),
          ...(departments && { departments }),
        },
        { merge: true }
      )
    }

    await db.doc(`users/${userRecord.uid}`).set(
      {
        ...(email && { email }),
        ...(name && { name }),
        ...(lastName && { lastName }),
        ...(displayName && { fullName: displayName }),
        ...(nickname && { nickname }),
        ...(typeof avatar !== 'undefined' && { avatar }),
        ...(rol && { rol }),
        ...(typeof archived !== 'undefined' && { archived }),
        ...(departments && { departments }),
      },
      { merge: true }
    )
    return { message: 'User updated' }
  } catch (error) {
    // eslint-disable-next-line
    console.log(error)
    return { error }
  }
})
