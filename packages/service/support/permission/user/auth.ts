import { TeamTmbItemType } from '@fastgpt/global/support/user/team/type';
import { parseHeaderCert } from '../controller';
import { getTmbInfoByTmbId } from '../../user/team/controller';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import { AuthModeType, AuthResponseType } from '../type';
import { NullPermission } from '@fastgpt/global/support/permission/constant';
import { TeamPermission } from '@fastgpt/global/support/permission/user/controller';
import { authCert } from '../auth/common';
import { MongoUser } from '../../user/schema';
import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';
import { ApiRequestProps } from '../../../type/next';

/* auth user role  */
export async function authUserPer(props: AuthModeType): Promise<
  AuthResponseType<TeamPermission> & {
    teamPer: TeamPermission;
    tmb: TeamTmbItemType;
    [Symbol.iterator](): IterableIterator<any>;
  }
> {
  const result = await parseHeaderCert(props);
  const tmb = await getTmbInfoByTmbId({ tmbId: result.tmbId });

  let teamPermission: TeamPermission;
  if (result.isRoot) {
    teamPermission = new TeamPermission({ isOwner: true });
  } else {
    if (!tmb.permission.checkPer(props.per ?? NullPermission)) {
      return Promise.reject(TeamErrEnum.unAuthTeam);
    }
    teamPermission = tmb.permission;
  }

  const ret = {
    ...result,
    permission: teamPermission,
    teamPer: teamPermission,
    tmb,
    [Symbol.iterator]: function* () {
      yield this.teamId;
      yield this.tmbId;
      yield this.permission;
    }
  };

  return ret;
}

export const authSystemAdmin = async ({ req }: { req: ApiRequestProps }) => {
  try {
    const result = await authCert({ req, authToken: true });
    const user = await MongoUser.findOne({
      _id: result.userId
    });

    if (user && user.username !== 'root') {
      return Promise.reject(ERROR_ENUM.unAuthorization);
    }
    return result;
  } catch (error) {
    throw error;
  }
};
