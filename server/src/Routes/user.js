import { login, getClientUserRepresentation, getUserForSessionId, logout, checkPassword, register, getUsers } from '../Services/users';
import { User, Role } from '../models';

async function getUser(ctx): ?ClientUser {
  return await getUserForSessionId(ctx.request.headers.sessionid);
}

global.router.post('/api/login', async function(ctx) {
  const { username, password } = ctx.request.body;
  const { user, sessionId } = await login(username, password);
  if (user) {
    ctx.body = {
      sessionId,
      user: getClientUserRepresentation(user),
    };
  } else {
    ctx.status = 403;
  }
});

global.router.post('/api/userForSessionId', async function(ctx) {
  const user = await getUser(ctx);
  if (user) {
    ctx.body = getClientUserRepresentation(user);
  } else {
    ctx.status = 400;
  }
});

global.router.post('/api/logout', (ctx) => {
  if (ctx.request.headers.sessionid) {
    logout(ctx.request.headers.sessionid);
  }
  ctx.status = 200;
});

global.router.post('/api/changePassword', async function(ctx) {
  const { oldPassword, newPassword } = ctx.request.body;
  const user = await getUser(ctx);
  if (user) {
    const correctOld = await checkPassword(oldPassword, user);
    if (!correctOld) {
      ctx.status = 400;
      return;
    }
    await User.update({ id: user.id }, { password: newPassword });
  } else {
    ctx.status = 400;
  }
});

global.router.post('/api/register', async function(ctx) {
  const { username, password, email } = ctx.request.body;
  if (!username || !password || !email) {
    throw { message: 'Please fill out all fields.' };
  }
  await register(username, password, email);
  ctx.status = 200;
});

global.router.get('/api/getUsers', async function(ctx) {
  const user = await getUser(ctx);
  if (user) {
    ctx.body = await getUsers();
  } else {
    ctx.status = 400;
  }
});

global.router.post('/api/saveActive', async function(ctx) {
  const ownUser = await getUser(ctx);
  if (ownUser) {
    if (!ownUser.role.canActivateUser) {
      throw { message: 'insufficent permissions' };
    }
    const { user, active } = ctx.request.body;
    const userToSave = await User.findOne({ id: user.id });
    userToSave.active = active;
    await userToSave.save();
    ctx.status = 200;
  } else {
    ctx.status = 400;
  }
});

global.router.post('/api/saveRole', async function(ctx) {
  const ownUser = await getUser(ctx);
  if (ownUser) {
    if (!ownUser.role.canChangeUserRole) {
      throw { message: 'insufficent permissions' };
    }
    const { user, role } = ctx.request.body;
    const userToSave = await User.findOne({ id: user.id });
    const newRole = await Role.findOne({ id: role.id });
    userToSave.role = newRole.id;
    await userToSave.save();
    ctx.status = 200;
  } else {
    ctx.status = 400;
  }
});

global.router.post('/api/deleteUser', async function(ctx) {
  const ownUser = await getUser(ctx);
  if (ownUser) {
    if (!ownUser.role.canDeleteUser) {
      throw { message: 'insufficent permissions' };
    }
    const { user } = ctx.request.body;
    const userToDelete = await User.findOne({ id: user.id });
    await userToDelete.destroy();
    ctx.status = 200;
  } else {
    ctx.status = 400;
  }
});