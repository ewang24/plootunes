import * as path from 'path';
import * as os from 'os';

/**
 * Resolves the directory where album cover images are stored.
 * In the running Electron app COVERS_PATH is set in app.ts from the
 * platform-specific userData directory. Outside Electron (e.g. tests) it
 * falls back to a directory under the user's home folder.
 */
export function getCoversPath(): string {
    return process.env.COVERS_PATH || path.join(os.homedir(), '.plootunes', 'covers');
}
