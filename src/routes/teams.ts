import { createTeam, listTeams, getTeam, removeTeam, updateTeam } from 'controllers/teams';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isTeamUser } from 'middlewares/teams';
import teamUsersRoutes from './teamUsers';

const teamRoutes: Router = Router();
const cb = errorHandler;

teamRoutes.post('/', [isOrgPM], cb(createTeam));
teamRoutes.put('/', [isOrgPM, isTeamUser], cb(updateTeam));
teamRoutes.get('/:team_id', [isOrgUser, isTeamUser], cb(getTeam));
teamRoutes.delete('/', [isOrgPM, isTeamUser], cb(removeTeam));
teamRoutes.get('/list/:organisation_id', [isOrgUser], cb(listTeams));

teamRoutes.use('/users', teamUsersRoutes);

export default teamRoutes;
