## GCP software delivery demo

### Setup

#### Configure trigger in cloud build for repo

#### Development cluster
- Create a Development GKE cluster
- create a `dev` namespace
- local development 

`skaffold dev --port-forward`

#### Staging and Prod clusters

- Create 2 GKE clusters to simulate staging and prod clusters
- create ingresses in advance for the projects if necessary, for demo purposes to show the change in app
```
kubectl apply -f manifests/pipeline/ingress.yaml --context <staging cluster>
kubectl apply -f manifests/pipeline/ingress.yaml --context <prod cluster>
```

#### basic flow
- make changes in codes during inner-loop , watch skaffold picks up changes 
- commit codes to repo, watch cloud deploy picks up changes and user approval flow 

#### binary auth, 
- To test binary auth, create a binary auth following the doc, 

- use the local-build.yaml, it does not go through cloud build so will fail the validation

`kubectl apply -f local-build.yaml --context <staging cluster>`