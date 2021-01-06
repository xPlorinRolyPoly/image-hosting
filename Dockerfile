FROM public.ecr.aws/lambda/nodejs:12

COPY app.js package*.json ${LAMBDA_TASK_ROOT}/
RUN npm install
CMD [ "app.handler" ]