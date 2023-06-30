```mermaid
%% Webchat Create Token
sequenceDiagram

actor C as Customer
participant S as Starship
participant FWO as FlexWebchatOrchestratorService
participant FAS as FederatedAuthService
participant SAS as ScopedAuthService
participant FC as FlexConfigurationService

mainframe Webchat Create Token

C ->> FWO : POST /V3/Webchat/Token <br/>req.body.deploymentKey=<deployment_key>
activate FWO
FWO ->> FWO : Fetches accountSid with Deployment Key
FWO ->> FC : GET /V2/Configuration/Public?AccountSid=<ACCOUNT_SID>
activate FC
FC ->> FWO : Receives allowedOrigins
deactivate FC
FWO ->> FWO : Keeps allowedOrigins locally till execution ends

alt Webchat Security feature is turned off via Feature Flag
  FWO ->> FAS : POST /v3/Accounts/ACXXXXX/Tokens
  activate FAS
  FAS ->> SAS : POST /v2/ScopedAuthTokens/generate/internal <br/>req.body.accountSid=<sid><br/>req.body.grants=<grants_json><br/>req.body.ttl=<ttl><br/>req.body.encrypt=true
  activate SAS
  SAS ->> FAS : {token: <generated_token>, identity: <random_generated_uuid>}
end

alt Feature is on and Fingerprint generation failed!
  FWO ->> FWO: generateFingerPrint throws error
  FWO ->> FWO : Sets ACAO response header to * if allowedOrigins is  empty. <br/> otherwise sets comma separated value
  FWO ->> S : Returns 404 unauthorised
  activate S
end

alt #LightBlue Feature is turned on & Fingerprint is generated
  FWO ->> FAS : POST /v3/Accounts/ACXXXXX/Tokens <br/>req.body.fingerprint=<generated_finger_print> <br/>req.body.token=<token> 
  FAS ->> SAS : POST /v2/ScopedAuthTokens/generate/internal <br/>req.body.fingerprint=<generated_finger_print><br/>...
  SAS ->> FAS : {token: <generated_token_with_fingerprint>, identity: <random_generated_uuid>}
  deactivate SAS
  FAS ->> FWO : {token: <generated_token_with_fingerprint>, identity: <random_generated_uuid>}
  deactivate FAS
end

FWO ->> FWO : Sets the ACAO response header to * if allowedOrigins is  empty. <br/> otherwise sets comma separated value
FWO ->> S : res.body={token: <generated_token_with_fingerprint>}<br/>res.header.ACAO='*.twilio.com'
deactivate FWO
S ->> S : If ACAO header exists, then passes through, else sets to *
S ->> C : res.body={token: <generated_token_with_fingerprint>}<br/>res.header.ACAO='*.twilio.com'
deactivate S

```