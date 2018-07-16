import s3 from 'aws-sdk/clients/s3';
import AWS from 'aws-sdk/global';

const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME;
const bucketRegion = process.env.REACT_APP_AWS_REGION;
const IdentityPoolId = process.env.REACT_APP_AWS_IDENTITY_POOL_ID;

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

const s3Bucket = new s3({
    params: { Bucket: bucketName }
});

export default s3Bucket;
