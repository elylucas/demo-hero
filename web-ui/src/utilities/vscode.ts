import type { WebviewApi } from 'vscode-webview';

interface Message<T = any> {
  command: string;
  data?: T;
}

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */
class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;
  private messageListeners: Record<
    string,
    { id: string; callback: (data: any) => void }[]
  > = {};
  private newDataAvailableListeners: { id: string; callback: () => void }[] =
    [];

  constructor() {
    // Check if the acquireVsCodeApi function exists in the current development
    // context (i.e. VS Code development window or web browser)
    if (typeof acquireVsCodeApi === 'function') {
      this.vsCodeApi = acquireVsCodeApi();
      window.addEventListener('message', (e) => {
        console.log({ e });
        const message = e.data;
        const listeners = this.messageListeners[message.command];
        listeners.forEach((msg) => msg.callback(message.data));
      });
      this.onMessageReceived('newDataAvailable', () => {
        this.newDataAvailableListeners.forEach((x) => x.callback());
      });
    }
  }

  /**
   * Post a message (i.e. send arbitrary data) to the owner of the webview.
   *
   * @remarks When running webview code inside a web browser, postMessage will instead
   * log the given message to the console.
   *
   * @param message Arbitrary data (must be JSON serializable) to send to the extension context.
   */
  public postMessage(message: Message) {
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    } else {
      console.log(message);
    }
  }

  public onMessageReceived<T = any>(
    command: string,
    callback: (data: T) => void
  ) {
    const listeners = this.messageListeners[command] || [];
    const id = generateId();
    listeners.push({ id, callback });
    this.messageListeners[command] = listeners;
    return () => {
      this.messageListeners[command] = this.messageListeners[command].filter(
        (x) => x.id !== id
      );
    };
  }

  public onNewDataAvailable(callback: () => void) {
    const id = generateId();
    this.newDataAvailableListeners.push({ id, callback });
    return () => {
      this.newDataAvailableListeners = this.newDataAvailableListeners.filter(
        (x) => x.id !== id
      );
    };
  }

  /**
   * Get the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, getState will retrieve state
   * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @return The current state or `undefined` if no state has been set.
   */
  public getState(): unknown | undefined {
    if (this.vsCodeApi) {
      return this.vsCodeApi.getState();
    } else {
      const state = localStorage.getItem('vscodeState');
      return state ? JSON.parse(state) : undefined;
    }
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, setState will set the given
   * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   *
   * @return The new state.
   */
  public setState<T extends unknown | undefined>(newState: T): T {
    if (this.vsCodeApi) {
      return this.vsCodeApi.setState(newState);
    } else {
      localStorage.setItem('vscodeState', JSON.stringify(newState));
      return newState;
    }
  }
}

function generateId(): string {
  return Math.floor((1 + Math.random()) * 0x1000000000000)
    .toString()
    .substring(0, 6);
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper();
