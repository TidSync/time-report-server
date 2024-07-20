import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { OrganisationSchema } from 'schema/organisations';

const DEFAULT_ORGANISATION_ROLES = ['ADMIN', 'USER', 'VIEWER'];

export const createOrganisation = async (req: Request, res: Response) => {
  const validatedData = OrganisationSchema.parse(req.body);

  const organisation = await prismaClient.organisation.create({
    data: {
      name: validatedData.name,
      users: { connect: { id: req.user!.id } },
      organisation_roles: {
        create: DEFAULT_ORGANISATION_ROLES.map((role) => ({
          name: role,
          ...(role === 'ADMIN' ? { users: { connect: { id: req.user!.id } } } : {}),
        })),
      },
    },
  });

  res.json(organisation);
};
