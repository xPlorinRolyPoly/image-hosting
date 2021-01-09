# image-hosting

Repository for the image hosting service

### Requirment 
- AWS SAM CLI has to be installed. 
- AWS credentials like Access ID and Secret access key has to be configured. 

### Building App
```
sam build
```

### Deploying App
```
sam deploy
```
The application is deployed to provisioned Lambda by uploading to s3 bucket.