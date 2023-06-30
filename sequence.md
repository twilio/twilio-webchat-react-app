```mermaid
%% Example of sequence diagram
  sequenceDiagram
    C -> FWO : "POST /V2/Webchat/Token \nreq.body.deploymentKey=<deployment_key>"
    activate FWO
    FWO -> FWO : "Fetches accountSid with Deployment Key"
    FWO -> FC : "GET /V1/Configuration/Public?AccountSid=<ACCOUNT_SID>"
    activate FC
    FC -> FWO : "Receives allowedOrigins"
    destroy FC
    FWO -> FWO : "Keeps allowedOrigins locally till execution ends"

    end
```