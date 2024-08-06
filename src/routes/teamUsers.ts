import { addTeamUser, getTeamUsers, removeTeamUser } from 'controllers/teamUsers';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isTeamUser } from 'middlewares/teams';

const teamUserRoutes: Router = Router();

teamUserRoutes.post('/', [isOrgPM, isTeamUser], cb(addTeamUser));
teamUserRoutes.delete('/', [isOrgPM, isTeamUser], cb(removeTeamUser));
teamUserRoutes.get('/:team_id', [isOrgUser, isTeamUser], cb(getTeamUsers));

export default teamUserRoutes;
