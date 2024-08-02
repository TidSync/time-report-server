import { addTeamUser, getTeamUsers, removeTeamUser } from 'controllers/teamUsers';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isTeamUser } from 'middlewares/teams';

const teamUsersRoutes: Router = Router();
const cb = errorHandler;

teamUsersRoutes.post('/', [isOrgPM, isTeamUser], cb(addTeamUser));
teamUsersRoutes.delete('/', [isOrgPM, isTeamUser], cb(removeTeamUser));
teamUsersRoutes.get('/:team_id', [isOrgUser, isTeamUser], cb(getTeamUsers));

export default teamUsersRoutes;
