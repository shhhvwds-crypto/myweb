document.addEventListener('DOMContentLoaded', function() {
    const supabaseUrl = 'https://efznjerhihktwpgvkywo.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmem5qZXJoaWhrdHdwZ3ZreXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDMzNjgsImV4cCI6MjA3ODc3OTM2OH0.hdwEM0M5mcKF91ZPJR60z1rP3wbufhfKbKe2puy2WxM'; 
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const messageContainer = document.getElementById('message-container');
    const senderNameInput = document.getElementById('sender-name');
    const messageTextInput = document.getElementById('message-text');
    const sendButton = document.getElementById('send-button')
    const shareButton = document.getElementById('share-button');
    const participantCount = document.getElementById('count');

    let participantCountValue = 0;
    participantCount.textContent = participantCountValue;

    const imagePaths = [
        'img2/send.png',
        'img2/send2.png',
        'img2/send3.png',
        'img2/send4.png',
        'img2/send5.png',
        'img2/send6.png',
        'img2/send7.png',
        'img2/send8.png',
    ];

    const soundEffects = [
        document.getElementById('sound1'),
        document.getElementById('sound2'),
        document.getElementById('sound3'),
        document.getElementById('sound4'),
        document.getElementById('sound5'),
        document.getElementById('sound6'),
        document.getElementById('sound7'),
        document.getElementById('sound8')
    ];

 
    const existingParticipants = new Set();

   
    async function initRealtimeMessages() {
        try {
            console.log("开始监听 Supabase 实时数据...");

            await loadExistingMessages();


            const subscription = supabase
                .channel('messages')
                .on('postgres_changes', 
                    { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'messages' 
                    }, 
                    (payload) => {
                        console.log('收到新消息:', payload);
                        handleNewMessage(payload.new);
                    }
                )
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'messages'
                    },
                    () => {
  
                        loadExistingMessages();
                    }
                )
                .subscribe();

        } catch (error) {
            console.error("初始化实时监听错误:", error);
        }
    }


    async function loadExistingMessages() {
        try {
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            console.log("加载现有消息:", messages);

       
            const existingMessages = messageContainer.querySelectorAll('.message');
            const exampleMessage = existingMessages[0];
            
      
            messageContainer.innerHTML = '';
            
     
            if (exampleMessage) {
                messageContainer.appendChild(exampleMessage);
            }

 
            participantCountValue = 0;
            existingParticipants.clear();

    
            messages.forEach((message) => {
                addMessageToContainer(
                    message.sender,
                    message.content,
                    new Date(message.created_at).getTime()
                );

        
                if (message.sender && !existingParticipants.has(message.sender)) {
                    participantCountValue++;
                    existingParticipants.add(message.sender);
                }
            });

    
            participantCount.textContent = participantCountValue;

 
            messageContainer.scrollTop = messageContainer.scrollHeight;

        } catch (error) {
            console.error("加载消息错误:", error);
        }
    }


    function handleNewMessage(message) {
        addMessageToContainer(
            message.sender,
            message.content,
            new Date(message.created_at).getTime()
        );

        if (message.sender && !existingParticipants.has(message.sender)) {
            participantCountValue++;
            existingParticipants.add(message.sender);
            participantCount.textContent = participantCountValue;
        }


        messageContainer.scrollTop = messageContainer.scrollHeight;
    }


    async function sendMessageToSupabase(senderName, messageText) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        sender: senderName,
                        content: messageText,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) {
                throw error;
            }

            console.log("消息已保存:", data);
            return true;
        } catch (error) {
            console.error("保存消息错误:", error);
            alert('发送失败，请重试。错误: ' + error.message);
            return false;
        }
    }


    function resetButtonState() {
        sendButton.disabled = false;
        sendButton.innerHTML = '<span>传递温暖关怀</span><span>❤</span>';
    }

    shareButton.addEventListener('click', function() {
        copyWebsiteUrl();
    });

    function copyWebsiteUrl() {
        const websiteUrl = window.location.href;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(websiteUrl)
                .then(() => {
                    showShareSuccessMessage();
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    fallbackCopyText(websiteUrl);
                });
        } else {
            fallbackCopyText(websiteUrl);
        }
    }

    function fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showShareSuccessMessage();
            } else {
                alert('复制失败，请手动复制网址：' + text);
            }
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制网址：' + text);
        }
        
        document.body.removeChild(textArea);
    }

    function showShareSuccessMessage() {
        const shareSuccessMsg = document.createElement('div');
        shareSuccessMsg.textContent = '已复制网站链接！';
        shareSuccessMsg.style.position = 'fixed';
        shareSuccessMsg.style.top = '20px';
        shareSuccessMsg.style.left = '50%';
        shareSuccessMsg.style.transform = 'translateX(-50%)';
        shareSuccessMsg.style.backgroundColor = '#ff6b6b';
        shareSuccessMsg.style.color = 'white';
        shareSuccessMsg.style.padding = '10px 20px';
        shareSuccessMsg.style.borderRadius = '20px';
        shareSuccessMsg.style.zIndex = '1001';
        shareSuccessMsg.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        shareSuccessMsg.style.animation = 'fadeIn 0.5s, fadeOut 0.5s 2s forwards';
        shareSuccessMsg.style.fontSize = '14px';
        
        document.body.appendChild(shareSuccessMsg);
        
        setTimeout(() => {
            if (shareSuccessMsg.parentNode) {
                shareSuccessMsg.parentNode.removeChild(shareSuccessMsg);
            }
        }, 2500);
    }

    function playRandomEffect() {
        const randomImageIndex = Math.floor(Math.random() * imagePaths.length);
        const selectedImagePath = imagePaths[randomImageIndex];
        
        const randomSoundIndex = Math.floor(Math.random() * soundEffects.length);
        const selectedSound = soundEffects[randomSoundIndex];

        const effectImage = document.createElement('img');
        effectImage.className = 'effect-image';
        effectImage.src = selectedImagePath;
        effectImage.alt = '特效图片';

        document.body.appendChild(effectImage);

        if (selectedSound) {
            selectedSound.currentTime = 0; 
            selectedSound.play().catch(e => {
                console.log('音效播放失败:', e);
            });
        }

        setTimeout(() => {
            if (effectImage.parentNode) {
                effectImage.parentNode.removeChild(effectImage);
            }
        }, 3000);
    }

    function formatFullDateTime(timestamp){
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth()+1).toString().padStart(2,'0');
        const day = date.getDate().toString().padStart(2,'0');
        const hours = date.getHours().toString().padStart(2,'0');
        const minutes = date.getMinutes().toString().padStart(2,'0');

        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    }
    
    function addMessageToContainer(sender, content, timestamp){
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const timeString = formatFullDateTime(timestamp);

        messageDiv.innerHTML = `
        <div class="message-head">
                <span class="sender">${sender}</span>
                <span class="timestamp">${timeString}</span>
            </div>
            <div class="message-content">${content}</div>`;

        messageContainer.appendChild(messageDiv);
    }

    sendButton.addEventListener('click', async function(){
        const senderName = senderNameInput.value.trim();
        const messageText = messageTextInput.value.trim();

        if (!senderName){
            alert('请输入你的名字');
            return;
        }
        if (!messageText){
            alert('请输入祝福内容');
            return;
        }


        sendButton.disabled = true;
        sendButton.innerHTML = '<span>发送中...</span>';

        try {
 
            const success = await sendMessageToSupabase(senderName, messageText);

            if (success) {

                senderNameInput.value = '';
                messageTextInput.value = '';

                playRandomEffect();
                showSuccessMessage();
                createConfetti();
            }
        } catch (error) {
            console.error("发送过程错误:", error);
        } finally {

            resetButtonState();
        }
    });

    function createConfetti() {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti'; 
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style'; 
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-100px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa5a5', '#96ceb4', '#feca57'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.textContent = '温暖已传递！';
        successMsg.style.position = 'fixed';
        successMsg.style.top = '20px';
        successMsg.style.left = '50%';
        successMsg.style.transform = 'translateX(-50%)';
        successMsg.style.backgroundColor = '#4ecdc4';
        successMsg.style.color = 'white';
        successMsg.style.padding = '10px 20px';
        successMsg.style.borderRadius = '20px';
        successMsg.style.zIndex = '1000';
        successMsg.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        successMsg.style.animation = 'fadeIn 0.5s, fadeOut 0.5s 2s forwards';
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 2500);
    }

    function preloadImages() {
        imagePaths.forEach(path => {
            const img = new Image();
            img.src = path;
        });
    }

    preloadImages();
    initRealtimeMessages(); 
    
    console.log("祝福墙应用初始化完成 - Supabase 版本");
});