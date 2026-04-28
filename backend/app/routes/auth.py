from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import RoleEnum, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    payload = request.get_json() or {}
    required = ["name", "email", "phone", "password"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    if User.query.filter((User.email == payload["email"]) | (User.phone == payload["phone"])).first():
        return jsonify({"message": "Email or phone already exists."}), 409

    user = User(
        name=payload["name"],
        email=payload["email"],
        phone=payload["phone"],
        password=generate_password_hash(payload["password"]),
        role=RoleEnum.PATIENT,
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role.value})
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json() or {}
    identifier = payload.get("email") or payload.get("phone")
    password = payload.get("password")
    if not identifier or not password:
        return jsonify({"message": "Email/phone and password are required."}), 400

    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials."}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role.value})
    return jsonify({"token": token, "user": user.to_dict()})
