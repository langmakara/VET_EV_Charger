import { useABAMiniApp } from '@/composables/useNativeBridge';
import { generateSha256 } from '@/utils/crypto';

// Replace this with your actual sandbox/mock key for local testing environment configurations
const TEST_SECRET_KEY = "YOUR_TEST_SECRET_KEY_HERE";

export async function testAndValidateUserProfile(): Promise<boolean> {
  const { userProfile, getProfile } = useABAMiniApp();

  try {
    // 1. Ensure profile is retrieved (fallback to getProfile() if not yet cached)
    const profileData = (userProfile.value || (await getProfile())) as any;
    if (!profileData) {
      console.warn('[Testing Gateway Log] No user profile data available.');
      return false;
    }

    // Extract the profile attributes explicitly matching the screenshot requirements
    const {
      appId = '',
      firstName = '',
      lastName = '',
      fullName = '',
      sex = '',
      dobShort = '',
      nationality = '',
      hash: nativeProvidedHash = '' // The validation hash signature received from the bridge runtime
    } = profileData;

    // 2. Concatenate the fields sequentially into a unified plaintext layout block
    const rawConcatenatedString = `${appId}${firstName}${lastName}${fullName}${sex}${dobShort}${nationality}${TEST_SECRET_KEY}`;
    
    // 3. Enforce complete uppercase modification as requested by the procedure code layout
    const plainText = rawConcatenatedString.toUpperCase();
    
    // 4. Generate the local cryptographic signature profile string value
    const localComputedHash = await generateSha256(plainText);
    
    console.log('[Testing Gateway Log] Plaintext target:', plainText);
    console.log('[Testing Gateway Log] Hash received from Native:', nativeProvidedHash);
    console.log('[Testing Gateway Log] Hash calculated locally:', localComputedHash);

    // 5. Assert identity alignment validation
    if (nativeProvidedHash === localComputedHash) {
      console.log('✅ Local test validation success: Hashes match perfectly!');
      return true;
    } else {
      console.warn('❌ Local test validation anomaly detected: Verification key signatures mismatched.');
      return false;
    }
  } catch (error) {
    console.error('Failed executing test profile assertion sequence loops:', error);
    return false;
  }
}
