from flask import Flask, render_template
# from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'segredo'
# socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def main():
    return render_template("index.html")

# @app.route("/cube")
# def cube():
#     return render_template("cube.html")

# @socketio.on('connect')
# def on_connect():
#     print('Usuário conectado')

# @socketio.on('disconnect')
# def on_disconnect():
#     print('Usuário desconectou')

# @socketio.on('player_move')
# def on_player_move(data):
#     print('Movimento do player:', data)
#     emit('update_player', data, broadcast=True, include_self=False)

# port = int(os.environ.get("PORT", 5000))
# socketio.run(app, host="0.0.0.0", port=port)
