# image-hosting

This Repo is still in progress..

## Docker Build
```
docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com

docker build -t upscale-image-hosting .

docker tag upscale-image-hosting:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/upscale-image-hosting:latest

docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/upscale-image-hosting:latest
```

