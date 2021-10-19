import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'

//const XAWS = AWSXRay.captureAWS(AWS)

// Implement CloudWatch metric

import { createLogger } from '../utils/logger'
const logger = createLogger('metricUtils')

const cloudwatchNamespace = 'Udacity/ServerlessEquipmentStatusApp'

export class MetricUtils {
    constructor(
        private readonly cloudwatch = new AWS.CloudWatch()) {
    }

    async setLatencyMetric(serviceName: string, totalTime: number) {
        logger.info(`Creating latency metric for ${serviceName} with latency ${totalTime} milliseconds`)

        // Generating another data point
        await this.cloudwatch.putMetricData({
            MetricData: [
                {
                    MetricName: 'Latency',
                    Dimensions: [
                        {
                            Name: 'ServiceName',
                            Value: serviceName
                        }
                    ],
                    Unit: 'Milliseconds',
                    Value: totalTime
                }
            ],
            Namespace: cloudwatchNamespace
        }).promise()   
    }
}