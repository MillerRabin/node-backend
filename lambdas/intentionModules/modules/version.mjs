export function getFunctionName () {  
  return process.env['AWS_LAMBDA_FUNCTION_NAME']?.toLowerCase() ?? null;
}

export function getStorageId () {  
  return process.env['STORAGE_ID'];
}


export function getStage () {  
  const stage = process.env['STAGE']?.toLowerCase() ?? null;
  if (stage != null) return stage;
  const lambdaName = getFunctionName();
  if (lambdaName == null) return null;
  const sa = lambdaName.split('-');
  return sa[sa.length - 1];  
}

export default {
  getStage, getFunctionName, getStorageId
}