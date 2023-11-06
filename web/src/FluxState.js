import React, { useState } from 'react';
import jp from 'jsonpath'

function FluxState(props) {
  const { store } = props

  const [fluxState, setFluxState] = useState(store.getState().fluxState);
  store.subscribe(() => setFluxState(store.getState().fluxState))

  return (
    <div>
      <GitRepositories gitRepositories={fluxState.gitRepositories} />
      <h2>Kustomizations</h2>
      <table>
        <thead>
          <tr>
            <th>NAMESPACE</th>
            <th>NAME</th>
            <th>URL</th>
            <th>READY</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
        {
        fluxState.kustomizations?.map(kustomization => {
          const ready = jp.query(kustomization.status, '$..conditions[?(@.type=="Ready")].status');
          const message = jp.query(kustomization.status, '$..conditions[?(@.type=="Ready")].message');

          return (
            <tr key={kustomization.metadata.namespace/kustomization.metadata.name}>
              <td>{kustomization.metadata.namespace}</td>
              <td>{kustomization.metadata.name}</td>
              <td>{kustomization.status.lastAppliedRevision}</td>
              <td>{ready}</td>
              <td>{message}</td>
            </tr>
          )
        })
        }
        </tbody>
      </table>
    </div>
  )
}

export function Kustomizations(props){
  const { kustomizations } = props

  return (
    <div className="grid gap-y-4 grid-cols-1">
      {
        kustomizations?.map(kustomization => {
          console.log(kustomization)

          const message = jp.query(kustomization.status, '$..conditions[?(@.type=="Ready")].message');
          const revision = kustomization.status.lastAppliedRevision
          const hash = revision.slice(revision.indexOf(':') + 1);

          return (
            <div
              className="rounded-md border border-neutral-300 p-4 grid grid-cols-12 gap-x-4 bg-white shadow"
              key={`${kustomization.metadata.namespace}/${kustomization.metadata.name}`}
              >
              <div className="col-span-2">
                <span className="block font-medium text-black">
                  {kustomization.metadata.name}
                </span>
                <span className="block text-neutral-600">
                  {kustomization.metadata.namespace}
                </span>
              </div>
              <div className="col-span-5">
                <span className="block font-medium text-neutral-700"><Ready gitRepository={kustomization}/></span>
                <span className="block text-neutral-600 field">{message}</span>
              </div>
              <div className="col-span-5">
                <span className="block field font-medium text-neutral-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h4 w-4 inline fill-current"><path d="M320 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm156.8-48C462 361 397.4 416 320 416s-142-55-156.8-128H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H163.2C178 151 242.6 96 320 96s142 55 156.8 128H608c17.7 0 32 14.3 32 32s-14.3 32-32 32H476.8z"/></svg>
                  <span className="pl-1"><a href="#" target="_blank" rel="noopener noreferrer">{hash.slice(0, 8)}</a></span>
                </span>
                {/* TODO
                  - status.lastAppliedRevision is the hash we run
                  - status.lastAttemptedRevision is the hash we want to deploy
                  - status.lastHandledReconcileAt is the time we last tried
                  - spec.sourceRef[?(@.kind=="GitRepository")].name is the git repo that we should link to
                  All this information should be on the UI. Probably ig status is not READY
                */}
                {/* <span className="block field text-neutral-600">{url}</span> */}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export function GitRepositories(props){
  const { gitRepositories } = props

  return (
    <div className="grid gap-y-4 grid-cols-1">
      {
        gitRepositories?.map(gitRepository => {
          const message = jp.query(gitRepository.status, '$..conditions[?(@.type=="Ready")].message');
          const revision = gitRepository.status.artifact.revision
          const hash = revision.slice(revision.indexOf(':') + 1);
          const url = gitRepository.spec.url.slice(gitRepository.spec.url.indexOf('@') + 1)

          return (
            <div 
              className="rounded-md border border-neutral-300 p-4 grid grid-cols-12 gap-x-4 bg-white shadow"
              key={`${gitRepository.metadata.namespace}/${gitRepository.metadata.name}`}
              >
              <div className="col-span-2">
                <span className="block font-medium text-black">
                  {gitRepository.metadata.name}
                </span>
                <span className="block text-neutral-600">
                  {gitRepository.metadata.namespace}
                </span>
              </div>
              <div className="col-span-5">
                <span className="block font-medium text-neutral-700"><Ready gitRepository={gitRepository}/></span>
                <span className="block text-neutral-600 field">{message}</span>
              </div>
              <div className="col-span-5">
                <span className="block field font-medium text-neutral-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h4 w-4 inline fill-current"><path d="M320 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm156.8-48C462 361 397.4 416 320 416s-142-55-156.8-128H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H163.2C178 151 242.6 96 320 96s142 55 156.8 128H608c17.7 0 32 14.3 32 32s-14.3 32-32 32H476.8z"/></svg>
                  <span className="pl-1"><a href={`https://${url}/commit/${hash}`} target="_blank" rel="noopener noreferrer">{hash.slice(0, 8)}</a></span>
                </span>
                <span className="block field text-neutral-600">{url}</span>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

function Ready(props) {
  const { gitRepository } = props
  const readyConditions = jp.query(gitRepository.status, '$..conditions[?(@.type=="Ready")].status');
  const ready = readyConditions.includes("True")

  const label = ready ? "Ready" : "Not Ready"

  return (
    <span className="relative">
      <span className="absolute -left-4 top-1 rounded-full h-3 w-3 bg-teal-400 inline-block"></span>
      <span >{label}</span>
    </span>
  )
}

export default FluxState;
