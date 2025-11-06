package com.aesp.service;

import com.aesp.entity.Role;
import com.aesp.enums.UserRole;
import com.aesp.exception.BadRequestException;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RoleService {

	private final RoleRepository roleRepository;

	public List<Role> findAll() {
		return roleRepository.findAll();
	}

	public Role getByName(String name) {
		if (!StringUtils.hasText(name)) {
			throw new BadRequestException("Role name không hợp lệ");
		}
		return roleRepository.findByName(name.trim())
				.orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại"));
	}

	@Transactional
	@SuppressWarnings("null")
	public Role create(String name, String description) {
		if (!StringUtils.hasText(name)) {
			throw new BadRequestException("Role name không được để trống");
		}
		String roleName = name.trim();
		if (roleRepository.existsByName(roleName)) {
			throw new BadRequestException("Role đã tồn tại");
		}
		Role role = Role.builder()
				.name(roleName)
				.description(description)
				.build();
		return Objects.requireNonNull(roleRepository.save(role));
	}

	@Transactional
	@SuppressWarnings("null")
	public Role getOrCreate(UserRole roleEnum) {
		if (roleEnum == null) {
			throw new BadRequestException("Role enum không hợp lệ");
		}
		String roleName = roleEnum.getValue();
		return roleRepository.findByName(roleName)
				.orElseGet(() -> {
					Role toSave = Role.builder()
							.name(roleName)
							.description("System role: " + roleName)
							.build();
					Role saved = Objects.requireNonNull(roleRepository.save(toSave));
					return saved;
				});
	}
}
