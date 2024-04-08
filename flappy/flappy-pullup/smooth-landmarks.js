/**
 * This will remove the jitter and smooth the landmarks given by Mediapipe
 * @author Yousuf Kalim
 */

const frameSets = [];
const smoothFrame = [];

const NUM_FRAMES = 4;
/**
 * smoothLandmarks
 * @param {Object} results This should be coming directly from Mediapipe
 * @param {Function} onResults Optional: If you want to call other function instead of getting return
 * @returns {Object}
 */
const smoothLandmarks = (results, onResults) => {
  // Pushing frame at the end of frameSet array
  if (results.landmarks && results.landmarks.length > 0 && results.landmarks[0]) {
    // console.log('pushing frame to frameSets', results.landmarks.length);
    frameSets.push(results.landmarks[0]);
  }
  // console.log(frameSets.length);
  if (frameSets.length === NUM_FRAMES) {
    // console.log(frameSets);
    // This loop will run 33 times to make an average of each joint
    for (let i = 0; i < 33; i++) {
      // Making an array of each joint coordinates
      // console.log(i);
      let x = frameSets.map((a) => a[i].x);
      let y = frameSets.map((a) => a[i].y);
      let z = frameSets.map((a) => a[i].z);
      let visibility = frameSets.map((a) => a[i].visibility);

      // Sorting the array into ascending order
      x.sort((a, b) => a - b);
      y.sort((a, b) => a - b);
      z.sort((a, b) => a - b);
      visibility.sort((a, b) => a - b);

      // Dropping 2 min and 2 max coordinates
      x = x.slice(2, 6);
      y = y.slice(2, 6);
      z = z.slice(2, 6);
      visibility = visibility.slice(2, 6);

      // Making the average of 4 remaining coordinates
      smoothFrame[i] = {
        x: x.reduce((a, b) => a + b, 0) / x.length,
        y: y.reduce((a, b) => a + b, 0) / y.length,
        z: z.reduce((a, b) => a + b, 0) / z.length,
        visibility: visibility.reduce((a, b) => a + b, 0) / visibility.length,
      };
    }

    // Removing the first frame from frameSet
    frameSets.shift();
  }

  // After the first NUM_FRAMES frames, we have averaged coordinates, so now updating the landmarks with averaged coordinates
  if (smoothFrame.length > 0) {
    results.landmarks = [smoothFrame];
  }

  return results;
  // return onResults ? onResults(results) : results;
};

export default smoothLandmarks;
