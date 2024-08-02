import { createTeam, listTeams, getTeam, removeTeam, updateTeam } from 'controllers/teams';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isTeamUser } from 'middlewares/teams';
import teamUsersRoutes from './teamUsers';

const teamsRoutes: Router = Router();
const cb = errorHandler;

teamsRoutes.post('/', [isOrgPM], cb(createTeam));
teamsRoutes.put('/', [isOrgPM, isTeamUser], cb(updateTeam));
teamsRoutes.get('/:team_id', [isOrgUser, isTeamUser], cb(getTeam));
teamsRoutes.delete('/', [isOrgPM, isTeamUser], cb(removeTeam));
teamsRoutes.get('/list/:organisation_id', [isOrgUser], cb(listTeams));

teamsRoutes.use('/users', teamUsersRoutes);

export default teamsRoutes;
