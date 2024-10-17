// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html#cfn-lambda-function-code-cfnresponsemodule-source-nodejs
import * as https from 'https';
import * as url from 'url';
import {
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceFailedResponse,
    CloudFormationCustomResourceSuccessResponse
} from 'aws-lambda';
import { Context } from 'aws-lambda/handler';

export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';

export const sendCfnResponse = async function (
    event: CloudFormationCustomResourceEvent,
    context: Context,
    response: CloudFormationCustomResourceSuccessResponse | CloudFormationCustomResourceFailedResponse
) {
    return new Promise((resolve, reject) => {
        const responseBody = JSON.stringify(response);
        const parsedUrl = url.parse(event.ResponseURL);
        const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: 'PUT',
            headers: {
                'content-type': '',
                'content-length': responseBody.length
            }
        };

        const request = https.request(options, function () {
            resolve(context.done());
        });

        request.on('error', function (error) {
            reject(context.done(error));
        });

        request.write(responseBody);
        request.end();
    });
};
