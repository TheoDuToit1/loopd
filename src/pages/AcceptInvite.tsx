import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LayoutDashboard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const processInvite = async () => {
      if (!token) {
        setStatus('error');
        setError('No invite token provided.');
        return;
      }

      if (!auth.currentUser) {
        // Redirect to login with invite token
        navigate(`/login?invite=${token}`);
        return;
      }

      try {
        // Find the invite
        const inviteRef = doc(db, 'project_invites', token);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
          setStatus('error');
          setError('Invalid or expired invite token.');
          return;
        }

        const inviteData = inviteSnap.data();
        if (inviteData.accepted) {
          setStatus('error');
          setError('This invite has already been used.');
          return;
        }

        // Add user to project if projectId exists
        if (inviteData.projectId) {
          const projectUserRef = doc(db, 'projects', inviteData.projectId, 'users', auth.currentUser.uid);
          await setDoc(projectUserRef, {
            userId: auth.currentUser.uid,
            role: inviteData.role,
            joinedAt: serverTimestamp()
          });
        }

        // Mark invite as accepted
        await updateDoc(inviteRef, {
          accepted: true,
          acceptedAt: serverTimestamp(),
          acceptedBy: auth.currentUser.uid
        });

        // Update user profile role if needed
        const profileRef = doc(db, 'profiles', auth.currentUser.uid);
        await updateDoc(profileRef, {
          role: inviteData.role === 'client' ? 'client' : 'developer'
        });

        setStatus('success');
        toast.success('Invite accepted! Welcome to the loop.');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (inviteData.role === 'client' && inviteData.projectId) {
            navigate(`/portal/${inviteData.projectId}`);
          } else if (inviteData.projectId) {
            navigate(`/dashboard/projects/${inviteData.projectId}`);
          } else {
            navigate('/dashboard');
          }
        }, 3000);

      } catch (err) {
        console.error(err);
        setStatus('error');
        setError('An error occurred while accepting the invite.');
      }
    };

    processInvite();
  }, [token, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#060714] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <LayoutDashboard className="text-white w-10 h-10" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="animate-spin text-[#4F46E5] mx-auto" size={48} />
            <h2 className="text-2xl font-bold text-white">Accepting Invite...</h2>
            <p className="text-[var(--dark-grey)]">Please wait while we add you to the loop.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="text-emerald-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold text-white">Welcome Aboard!</h2>
            <p className="text-[var(--dark-grey)]">Invite accepted successfully. Redirecting you to the project...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="text-red-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold text-white">Oops!</h2>
            <p className="text-[var(--dark-grey)]">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
