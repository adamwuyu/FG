import {
  PushDatasetDataChunkProps,
  PushDatasetDataResponse
} from '@fastgpt/global/core/dataset/api';
import { APIFileServer, FeishuServer, YuqueServer } from '@fastgpt/global/core/dataset/apiDataset';
import {
  DatasetSearchModeEnum,
  DatasetSourceReadTypeEnum,
  DatasetTypeEnum,
  ImportDataSourceEnum,
  TrainingModeEnum
} from '@fastgpt/global/core/dataset/constants';
import {
  DatasetDataIndexItemType,
  SearchDataResponseItemType
} from '@fastgpt/global/core/dataset/type';
import { NodeInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { PermissionValueType } from '@fastgpt/global/support/permission/type';

/* ================= dataset ===================== */
export type CreateDatasetParams = {
  parentId?: string;
  type: DatasetTypeEnum;
  name: string;
  intro: string;
  avatar: string;
  vectorModel?: string;
  agentModel?: string;
  apiServer?: APIFileServer;
  feishuServer?: FeishuServer;
  yuqueServer?: YuqueServer;
};

export type RebuildEmbeddingProps = {
  datasetId: string;
  vectorModel: string;
};

/* ================= collection ===================== */
export type CreateCollectionResponse = Promise<{
  collectionId: string;
  results: PushDatasetDataResponse;
}>;

/* ================= data ===================== */
export type InsertOneDatasetDataProps = PushDatasetDataChunkProps & {
  collectionId: string;
  reqToken?: string;
  reqTeamId?: string;
  reqTmbId?: string;
  subject?: string;
  name?: string;
  contact?: string;
  gender?: string;
  age?: string;
  target?: string;
  charater?: string;
  yuansheng?: string;
  mobile?: string;
  milestones?: string;
  qinzi?: string;
  education?: string;
  social?: string;
  work?: string;
  disease?: string;
  additional?: string;
};

/* ================= update: Adam新增 ===================== */
export type UpdateDatasetDataProps = {
  id: string;
  q?: string; // embedding content
  a?: string; // bonus content
  reqToken?: string;
  reqTeamId?: string;
  reqTmbId?: string;
  subject?: string;
  name?: string;
  contact?: string;
  gender?: string;
  age?: string;
  target?: string;
  charater?: string;
  yuansheng?: string;
  mobile?: string;
  milestones?: string;
  qinzi?: string;
  education?: string;
  social?: string;
  work?: string;
  disease?: string;
  additional?: string;
  indexes: (Omit<DatasetDataIndexItemType, 'dataId'> & {
    dataId?: string; // pg data id
  })[];
};

export type GetTrainingQueueProps = {
  vectorModel: string;
  agentModel: string;
};
export type GetTrainingQueueResponse = {
  vectorTrainingCount: number;
  agentTrainingCount: number;
};

/* -------------- search ---------------- */
export type SearchTestProps = {
  datasetId: string;
  text: string;
  [NodeInputKeyEnum.datasetSimilarity]?: number;
  [NodeInputKeyEnum.datasetMaxTokens]?: number;
  [NodeInputKeyEnum.datasetSearchMode]?: `${DatasetSearchModeEnum}`;
  [NodeInputKeyEnum.datasetSearchUsingReRank]?: boolean;

  [NodeInputKeyEnum.datasetSearchUsingExtensionQuery]?: boolean;
  [NodeInputKeyEnum.datasetSearchExtensionModel]?: string;
  [NodeInputKeyEnum.datasetSearchExtensionBg]?: string;

  [NodeInputKeyEnum.datasetDeepSearch]?: boolean;
  [NodeInputKeyEnum.datasetDeepSearchModel]?: string;
  [NodeInputKeyEnum.datasetDeepSearchMaxTimes]?: number;
  [NodeInputKeyEnum.datasetDeepSearchBg]?: string;
};
export type SearchTestResponse = {
  list: SearchDataResponseItemType[];
  duration: string;
  limit: number;
  searchMode: `${DatasetSearchModeEnum}`;
  usingReRank: boolean;
  similarity: number;
  queryExtensionModel?: string;
};

/* =========== training =========== */
