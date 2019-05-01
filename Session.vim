let SessionLoad = 1
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
cd /media/kenCode/kenkeJ/Source/2019/capstone/socket/SocketServer
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +277 controller/TradeController.js
badd +60 socket/SocketServer.js
badd +1 Constants.js
badd +5 model/ItemModel.js
badd +21 model/TradeModel.js
badd +35 bin/www
badd +7 util/FetchUtil.js
badd +17 routes/TradeRoute.js
badd +45 controller/ItemController.js
badd +25 app.js
badd +9 model/TransactionModel.js
badd +30 controller/TransactionController.js
badd +17 /usr/share/nvim/runtime/doc/help.txt
badd +5 model/NotificationModel.js
badd +17 controller/NotificationController.js
badd +6 model/UserModel.js
badd +30 controller/UserController.js
argglobal
silent! argdel *
edit controller/ItemController.js
set splitbelow splitright
set nosplitbelow
set nosplitright
wincmd t
set winminheight=1 winminwidth=1 winheight=1 winwidth=1
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 1 - ((0 * winheight(0) + 21) / 42)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
1
normal! 0
tabnext 1
if exists('s:wipebuf') && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 winminheight=1 winminwidth=1 shortmess=filnxtToOcA
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
let g:this_session = v:this_session
let g:this_obsession = v:this_session
let g:this_obsession_status = 2
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
