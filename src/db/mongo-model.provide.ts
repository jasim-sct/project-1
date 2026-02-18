import { UserSchema } from 'src/schemas/user.schema';
import { Connection, Schema } from 'mongoose';
import { SoftwareTeamSchema } from 'src/schemas/softwareTeam.schema';

export const createModelProvider = (
    token: string,
    modelName: string,
    schema: Schema,
) => ({
    provide: token,
    useFactory: (connection: Connection) =>
        connection.models[modelName] ||
        connection.model(modelName, schema),
    inject: ['DATABASE_CONNECTION'],
});

export const modelProviders = [
    createModelProvider('USER_MODEL', 'User', UserSchema),
    createModelProvider(
        'SOFTWARE_TEAM_MODEL',
        'SoftwareTeam',
        SoftwareTeamSchema,
    ),
];
