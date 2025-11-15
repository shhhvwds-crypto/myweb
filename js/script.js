import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    const firebaseConfig = {
        apiKey: "AIzaSyBwx6GF3dLUcP39FEF2J9-xsckJL824AC0",
        authDomain: "myweb-f0b87.firebaseapp.com",
        projectId: "myweb-f0b87",
        storageBucket: "myweb-f0b87.firebasestorage.app",
        messagingSenderId: "825063658040",
        appId: "1:825063658040:web:1d46a51e902048bdce8ccd",
        measurementId: "G-7JQSN6ZKFS"
    };

    const messageContainer = document.getElementById('message-container');
    const senderNameInput = document.getElementById('sender-name');
    const messageTextInput = document.getElementById('message-text');
    const sendButton = document.getElementById('send-button')
    const shareButton = document.getElementById('share-button');
    const participantCount = document.getElementById('count');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

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

    // 用于跟踪已加载的参与者
    const existingParticipants = new Set();

    // 初始化：实时监听祝福消息
    function initRealtimeMessages() {
        try {
            // 创建查询，按时间戳降序排列
            const messagesQuery = query(
                collection(db, "messages"),
                orderBy("timestamp", "desc")
            );

            console.log("开始监听 Firestore 数据...");

            // 实时监听数据变化
            onSnapshot(messagesQuery, (snapshot) => {
                console.log("收到实时更新，文档数量:", snapshot.docs.length);
                
                // 清空现有消息（除了例句）
                const existingMessages = messageContainer.querySelectorAll('.message');
                const exampleMessage = existingMessages[0]; // 保存例句
                
                // 清空容器
                messageContainer.innerHTML = '';
                
                // 重新添加例句
                if (exampleMessage) {
                    messageContainer.appendChild(exampleMessage);
                }

                // 重置参与者计数
                participantCountValue = 0;
                existingParticipants.clear();

                // 添加所有消息
                snapshot.docs.forEach((doc) => {
                    const messageData = doc.data();
                    console.log("加载消息:", messageData);
                    
                    // 确保时间戳有效
                    let timestamp;
                    if (messageData.timestamp && messageData.timestamp.toDate) {
                        timestamp = messageData.timestamp.toDate().getTime();
                    } else {
                        timestamp = Date.now();
                    }

                    addMessageToContainer(
                        messageData.sender || "匿名",
                        messageData.content || "",
                        timestamp
                    );

                    // 更新参与者计数
                    if (messageData.sender && !existingParticipants.has(messageData.sender)) {
                        participantCountValue++;
                        existingParticipants.add(messageData.sender);
                    }
                });

                // 更新参与者计数显示
                participantCount.textContent = participantCountValue;

                // 滚动到底部
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }, (error) => {
                console.error("监听消息错误:", error);
                alert('连接实时数据失败，请刷新页面重试');
            });
        } catch (error) {
            console.error("初始化实时监听错误:", error);
        }
    }

    // 发送祝福到 Firebase
    async function sendMessageToFirebase(senderName, messageText) {
        try {
            const docRef = await addDoc(collection(db, "messages"), {
                sender: senderName,
                content: messageText,
                timestamp: serverTimestamp()
            });
            console.log("消息已保存，ID:", docRef.id);
            return true;
        } catch (error) {
            console.error("保存消息错误:", error);
            
            // 更详细的错误信息
            if (error.code === 'permission-denied') {
                alert('发送失败：权限不足。请检查 Firestore 安全规则');
            } else {
                alert('发送失败，请重试。错误: ' + error.message);
            }
            return false;
        }
    }

    // 修复按钮状态恢复函数
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

        // 禁用按钮防止重复提交
        sendButton.disabled = true;
        sendButton.innerHTML = '<span>发送中...</span>';

        try {
            // 保存到 Firebase
            const success = await sendMessageToFirebase(senderName, messageText);

            if (success) {
                // 清空输入框
                senderNameInput.value = '';
                messageTextInput.value = '';

                // 播放特效
                playRandomEffect();
                showSuccessMessage();
                createConfetti();
            }
        } catch (error) {
            console.error("发送过程错误:", error);
        } finally {
            // 无论成功失败，都恢复按钮状态
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

    // 初始化应用
    preloadImages();
    initRealtimeMessages(); // 启动实时监听
    
    console.log("祝福墙应用初始化完成");
});