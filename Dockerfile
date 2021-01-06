FROM public.ecr.aws/lambda/nodejs:12

COPY app.js ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}
RUN npm install

CMD [ "app.handler" ]