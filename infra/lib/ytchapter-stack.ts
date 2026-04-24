import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { MicroSaasStaticSite } from 'microsaas-infra';

const ZONE_ID = 'Z08710722R7QC38MUUSET';
const ZONE_NAME = 'bal.pe.kr';
const SUBDOMAIN = 'ytchapter';
const FQDN = `${SUBDOMAIN}.${ZONE_NAME}`;

export class YtchapterCertStack extends cdk.Stack {
  readonly certificate: acm.Certificate;
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: ZONE_ID,
      zoneName: ZONE_NAME,
    });
    this.certificate = new acm.Certificate(this, 'Cert', {
      domainName: FQDN,
      validation: acm.CertificateValidation.fromDns(zone),
    });
  }
}

interface StackProps extends cdk.StackProps {
  certificate: acm.ICertificate;
}

export class YtchapterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const site = new MicroSaasStaticSite(this, 'Site', {
      subdomain: SUBDOMAIN,
      hostedZoneId: ZONE_ID,
      hostedZoneName: ZONE_NAME,
      certificate: props.certificate,
      sourcePath: path.resolve(__dirname, '../../dist'),
      sharedOriginAccessControlId: 'E3VLE3DK5M8JSE',
      sharedRewriteFunctionArn: 'arn:aws:cloudfront::778021795831:function/bal-pe-kr-rewrite',
    });
    new cdk.CfnOutput(this, 'Url', { value: `https://${site.domainName}` });
    new cdk.CfnOutput(this, 'BucketName', { value: site.bucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: site.distribution.distributionId });
  }
}
